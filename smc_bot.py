# =============================================================================
# smc_bot.py — Bot de Trading Algorítmico con Smart Money Concepts (SMC)
# Autor  : Dilan Soto
# Librería: MetaTrader5 (oficial) + Pandas
# Objetivo: Arquitectura base modular lista para extenderse con lógica SMC
# =============================================================================

import sys
import MetaTrader5 as mt5
import pandas as pd
import plotly.graph_objects as go

# -----------------------------------------------------------------------------
# CONSTANTES GLOBALES
# Mapa de alias legibles → constantes nativas de MT5 para timeframes.
# Permite llamar get_candles("XAUUSD", "H1") en lugar de mt5.TIMEFRAME_H1.
# -----------------------------------------------------------------------------
TIMEFRAME_MAP: dict = {
    "M1":  mt5.TIMEFRAME_M1,
    "M5":  mt5.TIMEFRAME_M5,
    "M15": mt5.TIMEFRAME_M15,
    "M30": mt5.TIMEFRAME_M30,
    "H1":  mt5.TIMEFRAME_H1,
    "H4":  mt5.TIMEFRAME_H4,
    "D1":  mt5.TIMEFRAME_D1,
    "W1":  mt5.TIMEFRAME_W1,
    "MN1": mt5.TIMEFRAME_MN1,
}


# =============================================================================
# 1. CONEXIÓN ROBUSTA
# =============================================================================

def initialize_mt5() -> bool:
    """
    Inicializa la conexión con el terminal MetaTrader 5.

    Intenta establecer la conexión con mt5.initialize(). Si el terminal no
    está abierto o falla por cualquier razón, imprime el error, llama a
    mt5.shutdown() para liberar recursos y termina el programa con código 1.

    Returns:
        True si la conexión fue exitosa.
    """
    try:
        if not mt5.initialize():
            # mt5.last_error() devuelve una tupla (código, descripción)
            raise ConnectionError(f"Código de error MT5: {mt5.last_error()}")

        terminal = mt5.terminal_info()
        cuenta   = mt5.account_info()

        print(f"[OK]   Conectado al terminal MT5 — {terminal.name} (build {terminal.build})")
        print(f"[INFO] Cuenta: {cuenta.login} | Servidor: {cuenta.server} | Balance: {cuenta.balance} {cuenta.currency}")
        return True

    except Exception as e:
        print(f"[ERROR] Fallo al inicializar MT5: {e}")
        mt5.shutdown()
        sys.exit(1)


# =============================================================================
# 2. PIPELINE DE DATOS (Data Extraction)
# =============================================================================

def get_candles(symbol: str, timeframe: str, n: int = 200) -> pd.DataFrame:
    """
    Descarga las últimas `n` velas de un símbolo y timeframe dados.

    Convierte los datos crudos de MT5 en un DataFrame de Pandas limpio,
    con la columna 'time' transformada a datetime UTC para análisis inmediato.

    Args:
        symbol:    Símbolo del instrumento, ej. 'XAUUSD', 'EURUSD'.
        timeframe: Timeframe como string, ej. 'H1', 'M15', 'D1'.
                   Debe existir en TIMEFRAME_MAP.
        n:         Número de velas a descargar (default: 200).

    Returns:
        pd.DataFrame con columnas: time, open, high, low, close, tick_volume,
        spread, real_volume. Retorna un DataFrame vacío si hay error.
    """
    # Resolver el timeframe string → constante MT5
    tf_const = TIMEFRAME_MAP.get(timeframe.upper())
    if tf_const is None:
        print(f"[ERROR] Timeframe '{timeframe}' no reconocido. Use uno de: {list(TIMEFRAME_MAP.keys())}")
        return pd.DataFrame()

    # Descargar las últimas `n` velas desde la posición 0 (vela más reciente)
    rates = mt5.copy_rates_from_pos(symbol, tf_const, 0, n)

    if rates is None or len(rates) == 0:
        print(f"[ERROR] No se obtuvieron datos para {symbol} [{timeframe}]. "
              f"Detalle MT5: {mt5.last_error()}")
        return pd.DataFrame()

    # Construir DataFrame y limpiar tipos de datos
    df = pd.DataFrame(rates)

    # Convertir timestamp Unix (segundos) → datetime con zona horaria UTC
    df["time"] = pd.to_datetime(df["time"], unit="s", utc=True)

    # Ordenar cronológicamente (más antiguo primero) y reiniciar el índice
    df = df.sort_values("time").reset_index(drop=True)

    print(f"[OK]   {len(df)} velas descargadas — {symbol} [{timeframe}] "
          f"| Desde: {df['time'].iloc[0]} | Hasta: {df['time'].iloc[-1]}")

    return df


# =============================================================================
# 3. HELPERS DE ANÁLISIS SMC (Smart Money Concepts)
# =============================================================================

def detectar_swings(df: pd.DataFrame, window: int = 2) -> pd.DataFrame:
    """
    Identifica Swing Highs y Swing Lows (pivotes estructurales) en las velas.

    Un Swing High es una vela cuyo 'high' es estrictamente mayor que los
    `window` highs a su izquierda y a su derecha. Un Swing Low es lo opuesto
    con 'low'. Son la base de toda la estructura SMC: BOS, CHoCH y Order
    Blocks se construyen sobre estos pivotes.

    Args:
        df:     DataFrame de velas con columnas 'high' y 'low'.
        window: Velas a cada lado del pivote para validarlo (default: 2).
                Más grande = swings más significativos pero menos frecuentes.

    Returns:
        Copia del DataFrame con dos columnas booleanas nuevas:
          - swing_high: True si la vela es un máximo estructural.
          - swing_low:  True si la vela es un mínimo estructural.
    """
    df = df.copy()
    df["swing_high"] = False
    df["swing_low"] = False

    # Recorrer solo las velas que tengan `window` vecinos a cada lado
    for i in range(window, len(df) - window):
        high_actual = df["high"].iloc[i]
        low_actual  = df["low"].iloc[i]

        # Ventanas de comparación a izquierda y derecha (excluyendo la vela i)
        highs_izq = df["high"].iloc[i - window:i]
        highs_der = df["high"].iloc[i + 1:i + 1 + window]
        lows_izq  = df["low"].iloc[i - window:i]
        lows_der  = df["low"].iloc[i + 1:i + 1 + window]

        # Swing High: máximo estricto comparado con los vecinos
        if high_actual > highs_izq.max() and high_actual > highs_der.max():
            df.at[df.index[i], "swing_high"] = True

        # Swing Low: mínimo estricto comparado con los vecinos
        if low_actual < lows_izq.min() and low_actual < lows_der.min():
            df.at[df.index[i], "swing_low"] = True

    return df


# =============================================================================
# 4. VISUALIZACIÓN (Plotly)
# =============================================================================

def graficar_smc(df: pd.DataFrame, titulo: str = "Análisis SMC") -> None:
    """
    Dibuja un gráfico de velas interactivo con las zonas SMC detectadas.

    Renderiza un candlestick chart con Plotly y superpone marcadores para
    cada concepto SMC que esté presente como columna booleana en el DataFrame
    (swing_high, swing_low, y en el futuro: bos, choch, order_block, fvg).

    El gráfico se abre automáticamente en el navegador predeterminado.

    Args:
        df:     DataFrame procesado (salida de detectar_swings y siguientes).
                Debe contener al menos: time, open, high, low, close.
        titulo: Título a mostrar arriba del gráfico.
    """
    fig = go.Figure()

    # Capa 1: Velas japonesas (candlestick)
    fig.add_trace(go.Candlestick(
        x=df["time"],
        open=df["open"],
        high=df["high"],
        low=df["low"],
        close=df["close"],
        name="Precio",
        increasing_line_color="#26a69a",  # verde alcista
        decreasing_line_color="#ef5350",  # rojo bajista
    ))

    # Capa 2: Swing Highs (triángulo rojo apuntando hacia abajo, arriba de la vela)
    if "swing_high" in df.columns:
        sh = df[df["swing_high"]]
        fig.add_trace(go.Scatter(
            x=sh["time"],
            y=sh["high"] * 1.001,  # ligeramente arriba del high para que se vea
            mode="markers",
            marker=dict(symbol="triangle-down", color="red", size=12),
            name="Swing High",
        ))

    # Capa 3: Swing Lows (triángulo verde apuntando hacia arriba, debajo de la vela)
    if "swing_low" in df.columns:
        sl = df[df["swing_low"]]
        fig.add_trace(go.Scatter(
            x=sl["time"],
            y=sl["low"] * 0.999,  # ligeramente abajo del low
            mode="markers",
            marker=dict(symbol="triangle-up", color="lime", size=12),
            name="Swing Low",
        ))

    # Layout: tema oscuro, sin rangeslider, responsive
    fig.update_layout(
        title=titulo,
        xaxis_title="Tiempo (UTC)",
        yaxis_title="Precio",
        template="plotly_dark",
        xaxis_rangeslider_visible=False,
        height=700,
    )

    # Abrir en el navegador
    fig.show()


# =============================================================================
# 5. PLACEHOLDERS — Módulos SMC futuros
# =============================================================================

def analizar_liquidez_smc(df: pd.DataFrame) -> dict:
    """
    Analiza el DataFrame de velas en busca de zonas clave de liquidez SMC.

    Implementará conceptos de Smart Money Concepts como:
      - Order Blocks (OB): Última vela alcista/bajista antes de un impulso.
      - Fair Value Gaps (FVG): Desequilibrios de precio (gaps de 3 velas).
      - Break of Structure (BOS) / Change of Character (CHoCH).
      - Barridas de liquidez (equal highs/lows, stop hunts).

    Args:
        df: DataFrame de velas obtenido con get_candles(). Debe contener
            al menos las columnas: time, open, high, low, close.

    Returns:
        dict con las zonas identificadas, por ejemplo:
        {
            "order_blocks": [...],
            "fvg": [...],
            "bos": [...],
        }
    """
    pass


def ejecutar_orden_riesgo(symbol: str, direccion: str, riesgo_pct: float = 1.0) -> dict:
    """
    Ejecuta una orden de mercado en MT5 con gestión de riesgo dinámica.

    Calculará automáticamente el tamaño del lote basado en:
      - El balance actual de la cuenta.
      - El porcentaje de riesgo indicado.
      - La distancia al Stop Loss (en pips/puntos).

    Args:
        symbol:     Símbolo del instrumento, ej. 'XAUUSD'.
        direccion:  Dirección de la operación: 'BUY' o 'SELL'.
        riesgo_pct: Porcentaje del balance a arriesgar por operación (default: 1%).

    Returns:
        dict con el resultado de la orden, por ejemplo:
        {
            "ticket": 123456789,
            "symbol": "XAUUSD",
            "tipo": "BUY",
            "lote": 0.10,
            "precio_entrada": 2345.00,
            "stop_loss": 2330.00,
            "take_profit": 2375.00,
        }
    """
    pass


# =============================================================================
# 6. PUNTO DE ENTRADA
# =============================================================================

if __name__ == "__main__":
    # Paso 1: Conectar con el terminal MT5
    initialize_mt5()

    # Paso 2: Descargar datos de prueba
    df_xauusd = get_candles("XAUUSD", "H1", n=200)

    if not df_xauusd.empty:
        # Paso 3: Mostrar las últimas 5 velas para verificar el pipeline
        print("\n--- Últimas 5 velas (XAUUSD H1) ---")
        print(df_xauusd[["time", "open", "high", "low", "close", "tick_volume"]].tail())

        # Paso 4: Detectar swings estructurales
        df_con_swings = detectar_swings(df_xauusd, window=2)
        n_highs = df_con_swings["swing_high"].sum()
        n_lows  = df_con_swings["swing_low"].sum()
        print(f"\n[INFO] Swings detectados — Highs: {n_highs} | Lows: {n_lows}")

        # Mostrar los últimos 5 swings encontrados (highs y lows combinados)
        swings = df_con_swings[df_con_swings["swing_high"] | df_con_swings["swing_low"]]
        print("\n--- Últimos 5 swings ---")
        print(swings[["time", "high", "low", "swing_high", "swing_low"]].tail())

        # Paso 5: Visualizar en el navegador
        graficar_smc(df_con_swings, titulo="XAUUSD H1 — Swings SMC")

    # Paso 6: Cerrar la conexión limpiamente al terminar
    mt5.shutdown()
    print("\n[OK] Conexión MT5 cerrada.")

# Analíticas — módulo de Convive

Resúmenes y gráficos del gasto del hogar.

## Instalación

```
convive/module-analytics
```

## Endpoints

| Método | Ruta |
|---|---|
| GET | `/analytics/balance` |
| GET | `/analytics/summary?monthYear=YYYY-MM` |
| GET | `/analytics/by-category?monthYear=YYYY-MM` |
| GET | `/analytics/monthly-trend?months=12` |
| GET | `/analytics/budget-status?monthYear=YYYY-MM` |
| GET | `/analytics/user-comparison?monthYear=YYYY-MM` |

No crea tablas: lee de `expenses`, `settlements` y opcionalmente `budgets`.

## Depende de

- `expenses`
- `settlements`

## Licencia

MIT

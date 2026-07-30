import { usePlanoSemana } from '../../hooks/usePlanoSemana'
import { useTiposTreino } from '../../hooks/useTiposTreino'
import { useExercicios } from '../../hooks/useExercicios'
import { TipoTreinoConfig } from '../../components/academia/TipoTreinoConfig'

export function AcademiaTiposPage() {
  const { planoPorDia, loading: planoLoading, reload: reloadPlano } = usePlanoSemana()
  const { tipos, loading: tiposLoading, reload: reloadTipos } = useTiposTreino()
  const { exercicios, loading: exerciciosLoading, reload: reloadExercicios } = useExercicios()

  const loading = planoLoading || tiposLoading || exerciciosLoading

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-8 lg:px-10">
      <div>
        <p className="font-mono text-xs tracking-wide text-brass">ACADEMIA</p>
        <h1 className="font-display text-2xl text-parchment">Tipos de treino</h1>
        <p className="mt-1 font-body text-sm text-parchment-dim">
          Cadastre os treinos que você repete (ex: Peito/Tríceps, Perna) e os exercícios de cada um. Isso é o que
          aparece pré-selecionado quando você registra o dia.
        </p>
      </div>

      {!loading && (
        <TipoTreinoConfig
          tipos={tipos}
          exercicios={exercicios}
          planoPorDia={planoPorDia}
          onReloadTipos={reloadTipos}
          onReloadExercicios={reloadExercicios}
          onReloadPlano={reloadPlano}
        />
      )}
    </div>
  )
}

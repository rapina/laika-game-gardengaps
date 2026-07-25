import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { GameResult } from '../game/types'
import { GardenGame } from '../game/GardenGame'

interface Props {
    onGameOver(result: GameResult): void
    onExit(): void
}

/** Mounts the game runtime and exposes deterministic verification state. */
export default function GameScreen({ onGameOver, onExit }: Props) {
    const { t } = useTranslation()
    const hostRef = useRef<HTMLDivElement>(null)
    const endedRef = useRef(false)

    useEffect(() => {
        const host = hostRef.current
        if (!host) return

        const game = new GardenGame()
        game.mount(host, {
            onGameOver: (result) => {
                if (endedRef.current) return
                endedRef.current = true
                // Let the runtime's game-over presentation breathe briefly.
                setTimeout(() => onGameOver(result), 800)
            },
        })

        // Expose runtime state for scripts/smoke.mjs and agent debugging.
        const poll = setInterval(() => {
            ;(globalThis as unknown as Record<string, unknown>).__gameState = game.getDebugState()
        }, 250)

        return () => {
            clearInterval(poll)
            game.destroy()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="screen game-screen">
            <div ref={hostRef} className="game-host" />
            <button className="btn game-exit-btn" aria-label={t('game.exit')} onClick={onExit}>
                {t('game.exit')}
            </button>
        </div>
    )
}

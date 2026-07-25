import { useState } from 'react'
import MobileFrame from './components/MobileFrame'
import TitleScreen from './screens/TitleScreen'
import GameScreen from './components/GameScreen'

export default function App() {
    const [playing, setPlaying] = useState(false)
    return (
        <MobileFrame>
            {playing
                ? <GameScreen onGameOver={() => {}} onExit={() => setPlaying(false)} />
                : <TitleScreen onPlay={() => setPlaying(true)} onRanking={() => {}} />}
        </MobileFrame>
    )
}

import { useState, useEffect } from 'react'
import Monetization from './components/monetization/Monetization'
import AnimalTracker from './components/AnimalTracker'

function App() {

  return (
    <Monetization>
      <AnimalTracker />
    </Monetization>
  )
}

export default App
import { useEffect, useState } from 'react'
import { BlizzardApi } from './blizzardApi'
import { specNameToId } from './specMap'

export function useSpecInfo(specName: string, blizzardApi: BlizzardApi) {
  const [specInfo, setSpecInfo] = useState<{ icon: string; color: string } | null>(null)

  useEffect(() => {
    if (!specName) return

    const id = specNameToId[specName.replace(/\s+/g, '')] // remove espaços para tentar casar
    if (!id) {
      setSpecInfo(null)
      return
    }

    blizzardApi
      .getSpecData(id)
      .then(setSpecInfo)
      .catch(() => setSpecInfo(null))
  }, [specName, blizzardApi])

  return specInfo
}

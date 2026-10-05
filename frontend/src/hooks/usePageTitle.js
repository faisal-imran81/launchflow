import { useEffect } from 'react'

export const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title
      ? `${title} — LaunchFlow`
      : 'LaunchFlow — Deploy Smarter'
  }, [title])
}

import { createFileRoute } from '@tanstack/react-router'
import { ThemeSettings } from '~/components/theme'

export const Route = createFileRoute('/uses/theme')({
  head: () => ({
    meta: [
      { title: 'Theme Settings | sandybridge.io' },
      { name: 'description', content: 'Customize your visual experience with themes, colors, and effects.' },
    ],
  }),
  component: ThemeSettingsPage,
})

function ThemeSettingsPage() {
  return (
    <>
      <h1>Theme Settings</h1>
      <p>Customize your visual experience. Changes are saved automatically.</p>
      <ThemeSettings />
    </>
  )
}

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'nur-news',
  title: 'NUR News',
  projectId: 'l7g6k8p8',
  dataset: 'production',
  plugins: [structureTool(), visionTool()] as any,
  schema: { types: schemaTypes },
})
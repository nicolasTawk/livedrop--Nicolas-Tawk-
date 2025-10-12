import type { Meta, StoryObj } from '@storybook/react'
import ProductCard from './product-card'

const meta: Meta<typeof ProductCard> = {
  title: 'Molecules/ProductCard',
  component: ProductCard
}
export default meta
type S = StoryObj<typeof ProductCard>

export const Basic: S = {
  args: { id:'p1', title:'Demo Product', price:99, image:'https://picsum.photos/seed/p1/640/360' }
}

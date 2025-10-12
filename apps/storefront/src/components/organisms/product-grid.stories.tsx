import type { Meta, StoryObj } from '@storybook/react'
import ProductGrid from './product-grid'

const meta: Meta<typeof ProductGrid> = { title: 'Organisms/ProductGrid', component: ProductGrid }
export default meta
type S = StoryObj<typeof ProductGrid>

export const Basic: S = {
  args: {
    products: Array.from({length:8}).map((_,i)=>({ id:`p${i}`, title:`Product ${i}`, price: i*10+9, image:`https://picsum.photos/seed/${i}/640/360` }))
  }
}

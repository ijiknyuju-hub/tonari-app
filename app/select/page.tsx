import BaseDishSelector from '@/components/phase0/BaseDishSelector'
import { baseDishes } from '@/data/baseDishes'

export default function SelectPage() {
  return <BaseDishSelector baseDishes={baseDishes} />
}

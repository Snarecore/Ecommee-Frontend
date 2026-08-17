import { useParams } from "react-router-dom"

const ProductUpdate = () => {
    const {id} = useParams();
  return (
    <div>ProductUpdate {id}</div>
  )
}

export default ProductUpdate
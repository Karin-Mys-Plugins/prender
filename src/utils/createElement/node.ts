import { Props } from "@karin-mys/prender/types"
import { components } from "./components"
import { createElement } from "./createElement"

export default function (type: string, props: Props) {
  return createElement(components, type, props)
}

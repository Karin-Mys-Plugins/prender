import AdvancedText from '@karin-mys/prender/components/base/AdvancedText'
import BlurView from '@karin-mys/prender/components/base/BlurView/node'
import Button from '@karin-mys/prender/components/base/Button'
import Chart from '@karin-mys/prender/components/base/Chart/node'
import Checkbox from '@karin-mys/prender/components/base/Checkbox'
import ConicGradient from '@karin-mys/prender/components/base/ConicGradient'
import Img from '@karin-mys/prender/components/base/Image'
import LinearGradient from '@karin-mys/prender/components/base/LinearGradient'
import Painter from '@karin-mys/prender/components/base/Painter'
import RadialGradient from '@karin-mys/prender/components/base/RadialGradient'
import Switch from '@karin-mys/prender/components/base/Switch'
import Text from '@karin-mys/prender/components/base/Text'
import View from '@karin-mys/prender/components/base/View'
import Arc from '@karin-mys/prender/components/drawing/Arc'
import Circle from '@karin-mys/prender/components/drawing/Circle'
import DrawingText from '@karin-mys/prender/components/drawing/DrawingText'
import Ellipse from '@karin-mys/prender/components/drawing/Ellipse'
import Line from '@karin-mys/prender/components/drawing/Line'
import Path from '@karin-mys/prender/components/drawing/Path'
import Rect from '@karin-mys/prender/components/drawing/Rect'
import type { ComponentMap } from '@karin-mys/prender/types'

export const components: ComponentMap = {
  VIEW: View,
  TEXT: Text,
  ADVANCEDTEXT: AdvancedText,
  IMAGE: Img,
  LINEARGRADIENT: LinearGradient,
  RADIALGRADIENT: RadialGradient,
  CONICGRADIENT: ConicGradient,
  BUTTON: Button,
  SWITCH: Switch,
  CHECKBOX: Checkbox,
  PAINTER: Painter,
  ARC: Arc,
  CIRCLE: Circle,
  RECT: Rect,
  LINE: Line,
  PATH: Path,
  ELLIPSE: Ellipse,
  DRAWINGTEXT: DrawingText,
  CHART: Chart,
  BLURVIEW: BlurView,
  // Special type for raw text nodes.
  // The drawing logic is handled directly in the host config.
  RAW_TEXT: { draw: async (_ctx, _element) => { } },
};

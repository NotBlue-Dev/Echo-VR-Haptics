import HapticPlayer from './HapticPlayer';
import { DotPoint, PathPoint, ScaleOption, RotationOption, PositionType, ErrorCode } from './Interfaces';
declare const tactJs: HapticPlayer;
export default tactJs;
declare class TactJsUtils {
    static convertErrorCodeToString: (error: ErrorCode) => string;
}
export { DotPoint, PathPoint, ScaleOption, RotationOption, PositionType, ErrorCode, TactJsUtils };

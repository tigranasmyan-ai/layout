import { BaseBoxShapeUtil, HTMLContainer } from 'tldraw'

export class FlexShapeUtil extends BaseBoxShapeUtil {
    static type = 'flex'

    getDefaultProps() {
        return {
            w: 100,
            h: 100,
        }
    }

    component(shape) {
        return (
            <HTMLContainer
                id={shape.id}
                style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    border: '2px dashed rgba(59, 130, 246, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'all',
                }}
            >
                <div style={{ color: '#3b82f6', fontSize: 12, opacity: 0.5, userSelect: 'none' }}>
                    Flex Container
                </div>
            </HTMLContainer>
        )
    }

    indicator(shape) {
        return <rect width={shape.props.w} height={shape.props.h} />
    }
}

const STORAGE_KEY = 'flex-architect-state';

const getInitialState = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            return {
                blocks: parsed.blocks || [],
                blueprint: parsed.blueprint || { url: null, x: 0, y: 0, w: 1200, opacity: 0.5 },
                assets: parsed.assets || [],
                history: [parsed.blocks || []],
                historyIndex: 0
            };
        } catch (e) {
            console.error('Failed to parse saved state', e);
        }
    }
    return {
        blocks: [],
        blueprint: { url: null, x: 0, y: 0, w: 1200, opacity: 0.5 },
        assets: [],
        history: [[]],
        historyIndex: 0
    };
};

export const initialState = getInitialState();

export function layoutReducer(state, action) {
    let newState;
    switch (action.type) {
        case 'PUSH_BLOCKS':
            const newHistory = state.history.slice(0, state.historyIndex + 1);
            newState = {
                ...state,
                blocks: action.payload,
                history: [...newHistory, action.payload],
                historyIndex: newHistory.length
            };
            break;
        case 'SET_BLOCKS':
            newState = {
                ...state,
                blocks: action.payload
            };
            break;
        case 'UPDATE_BLUEPRINT':
            newState = {
                ...state,
                blueprint: { ...state.blueprint, ...action.payload }
            };
            break;
        case 'ADD_ASSET':
            newState = {
                ...state,
                assets: [...state.assets, action.payload]
            };
            break;
        case 'REMOVE_ASSET':
            newState = {
                ...state,
                assets: state.assets.filter(a => a.id !== action.payload)
            };
            break;
        case 'UNDO':
            if (state.historyIndex > 0) {
                newState = {
                    ...state,
                    blocks: state.history[state.historyIndex - 1],
                    historyIndex: state.historyIndex - 1
                };
            } else return state;
            break;
        case 'REDO':
            if (state.historyIndex < state.history.length - 1) {
                newState = {
                    ...state,
                    blocks: state.history[state.historyIndex + 1],
                    historyIndex: state.historyIndex + 1
                };
            } else return state;
            break;
        case 'CLEAR':
            newState = {
                ...state,
                blocks: [],
                blueprint: { url: null, x: 0, y: 0, w: 1200, opacity: 0.5 },
                assets: [],
                history: [[]],
                historyIndex: 0
            };
            break;
        default:
            return state;
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
        blocks: newState.blocks, 
        blueprint: newState.blueprint,
        assets: newState.assets 
    }));
    return newState;
}

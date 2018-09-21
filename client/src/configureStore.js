import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from './reducers/root';


const configureStore = (preloadedState) => {
    const loggerMiddleware = createLogger();
    
    const middlewares = [thunkMiddleware, loggerMiddleware];
    const middlewareEnhancer = applyMiddleware(...middlewares);
    const enhancers= [middlewareEnhancer];
    const composedEnhancers = composeWithDevTools(...enhancers);
    return createStore(
        rootReducer,
        preloadedState,
        composedEnhancers,
    );
};

export default configureStore;
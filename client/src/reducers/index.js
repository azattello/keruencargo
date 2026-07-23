import {applyMiddleware, combineReducers, createStore} from "redux";
import {composeWithDevTools} from "redux-devtools-extension";
import thunk from "redux-thunk";
import userReducer from "./userReducer";
import trackReducer from "./trackReducer";
import announcementReducer from "./announcementReducer";

const rootReducer = combineReducers({
    user: userReducer,
    tracks: trackReducer,
    announcements: announcementReducer,
})

export const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)))
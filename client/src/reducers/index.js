import {applyMiddleware, combineReducers, createStore} from "redux";
import {composeWithDevTools} from "redux-devtools-extension";
import thunk from "redux-thunk";
import userReducer from "./userReducer";
import trackReducer from "./trackReducer";
import announcementReducer from "./announcementReducer";
import courseReducer from "./courseReducer";

const rootReducer = combineReducers({
    user: userReducer,
    tracks: trackReducer,
    announcements: announcementReducer,
    courses: courseReducer,
})

export const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)))
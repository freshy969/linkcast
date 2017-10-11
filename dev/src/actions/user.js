import { request } from "./request";

export const saveProfile = (state, actions, { e, data }) => {
    e.preventDefault();
    data = Object.assign(state.user.data, data);
    return update => {
        let params = {
            queryParams: {
                chrome_id: state.chrome_id,
                nickname: data.nickname,
                color: data.color,
                bio: data.bio,
                action: "saveProfile"
            }
        };
        request(params).then(result => {
            state.user.data = data;
            update(state);
        });
    };
};
export const showProfile = (state, actions, { e, user_id }) => {
    e.preventDefault();
    return update => {
        state.modals.profile.links.isFetching = true;
        state.modals.profile.open = 1;
        update(state);
        let params1 = {
            queryParams: {
                chrome_id: state.chrome_id,
                target_id: user_id,
                action: "getProfile"
            }
        };
        request(params1).then(result => {
            state.modals.profile.user = result;
            state.modals.profile.user.id = user_id;
            state.modals.profile.links.data.page = 0;
            update(state);
        });
        actions.getUserLinks({ e, user_id });
    };
};

export const getUserLinks = (state, actions, { e, user_id }) => {
    e.preventDefault();
    return update => {
        state.modals.profile.links.isFetching = true;
        state.modals.profile.open = 1;
        update(state);
        let newPage = parseInt(state.modals.profile.links.data.page) + 1;
        let params2 = {
            queryParams: {
                chrome_id: state.chrome_id,
                target_id: user_id,
                action: "getOtherUserTracks",
                page: newPage,
                count: 5
            }
        };

        request(params2).then(result => {
            state.modals.profile.links.isFetching = false;
            if (newPage == 1) {
                state.modals.profile.links.data.rows = result.rows;
            } else {
                state.modals.profile.links.data.rows = state.modals.profile.links.data.rows.concat(
                    result.rows
                );
            }
            state.modals.profile.links.data.page = newPage;
            update(state);
        });
    };
};

export const initialize = (state, actions, { chrome_id, callback }) => {
    return update => {
        let params = {
            queryParams: {
                chrome_id: chrome_id,
                action: "fetchUserInfo"
            }
        };
        request(params).then(result => {
            if (result.flag == 1) {
                state.chrome_id = chrome_id;
                state.user.data = result.data;
                state.user.loggedIn = true;
                state.groups.defaultGroup = localStorage.defaultGroup;
                update(state);
                callback();
            }
        });
    };
};

export const saveCustomization = (state, actions, { e, key }) => {
    e.preventDefault();
    state.user.customize[key] = parseInt(e.target.value);
    localStorage[key] = parseInt(e.target.value);
    return state;
};
export const doLogout = (state, ctions, data) => {
    state.user.loggedIn = false;
    localStorage.clear();
    return state;
};

export const doLogin = (state, actions, data) => {
    return update => {
        let params = {
            method: "POST",
            queryParams: {
                chrome_id: state.chrome_id,
                nickname: data.nickname,
                password: data.password,
                action: "loginUser"
            }
        };

        if (data.nickname.length > 0 && data.password.length > 0) {
            state.user.login.requesting = true;
            update(state);
            request(params).then(result => {
                if (result.flag == 1) {
                    if (!localStorage.defaultGroup) {
                        localStorage.defaultGroup = 1;
                    }
                    //update localstorage
                    localStorage.nickname = data.nickname;
                    localStorage.loggedIn = true;
                    localStorage.chrome_id = result.data.chrome_id;
                    actions.fetchGroups();
                    //update the state
                    state.user.data = result.data;
                    state.user.loggedIn = true;

                    if (chrome.storage) {
                        chrome.storage.sync.set({
                            userid: result.data.chrome_id
                        });
                    }
                }
                state.user.login.requesting = false;
                state.user.login.msg = result.msg;
                state.user.login.flag = result.flag;
                update(state);
            });
        }
    };
};

export const doRegister = (state, actions, data) => {
    return update => {
        let params = {
            queryParams: {
                chrome_id: state.chrome_id,
                nickname: data.nickname,
                password: data.password,
                email: data.email,
                action: "registerUser"
            }
        };
        if (data.nickname.length > 0 && data.password.length > 0) {
            state.user.register.requesting = true;
            update(state);
            request(params).then(result => {
                if (result.flag == 1) {
                    //update localstorage
                    localStorage.nickname = data.nickname;
                    localStorage.loggedIn = true;
                    localStorage.chrome_id = result.data.chrome_id;
                    localStorage.defaultGroup = 1;
                    actions.fetchGroups();
                    //update the state
                    state.user.data = result.data;
                    state.user.loggedIn = true;

                    if (chrome.storage) {
                        chrome.storage.sync.set({
                            userid: response.data.chrome_id
                        });
                    }
                }
            });
        }
    };
};
import { request } from "./request";

let invites = [];

export const showInviteModal = (state, actions, { e, group_id }) => {
    e.preventDefault();
    return update => {
        state.modals.invite.open = true;
        state.modals.invite.group_id = group_id;
        update(state);
        let params = {
            queryParams: {
                chrome_id:
                    state.chrome_id,
                group_id: group_id,
                action: "getUsersToInvite"
            }
        };
        request( params).then(result => {
            state.modals.invite.data = result;
            update(state);
            actions.setInviteList({
                data: state.modals.invite.data.users,
                resetInvites: true
            });
            //actions.editInvites({ data: data.invites });
        });
    };
};

const ele = selector => {
    return document.querySelector(selector);
};
export const setInviteList = (state, actions, { data, resetInvites }) => {
    let dataClone = data;
    if (resetInvites) {
        invites = [];
    }
    const init = () => {
        dataClone = dataClone.sort((a, b) => {
            return b.nickname - a.nickname;
        });
        let list = ele(".token-input-list-facebook");
        let dd = ele(".token-input-dropdown-facebook");
        list && list.remove();
        dd && dd.remove();

        $("#tags-input-send-invites").tokenInput(dataClone, {
            theme: "facebook",
            preventDuplicates: true,
            searchDelay: 0,
            propertyToSearch: "nickname",
            prePopulate: invites,
            resultsLimit: 5,
            onAdd: user => {
                dataClone = dataClone.filter(item => {
                    return item.id != user.id;
                });
                invites.push(user);
                init();
            },
            onDelete: user => {
                invites = invites.filter(item => {
                    return user.id !== item.id;
                });
                data.map(item => {
                    if (item.id == user.id) {
                        dataClone.push(item);
                        init();
                        return false;
                    }
                });
            },
            onResult: function(results) {
                var tagsearch = $("#token-input-tags-input-send-invites").val();
                return results.filter(item => {
                    return (
                        item.nickname
                            .toLowerCase()
                            .indexOf(tagsearch.toLowerCase()) === 0
                    );
                });
            }
        });
        $("#tags-input-send-invites").focus();
    };
    init();
};

export const withdrawInvite = (state, actions, { e, invite_id, index }) => {
    let user = state.modals.invite.data.invites[index];
    delete state.modals.invite.data.invites[index];
    return update => {
        let params = {
            queryParams: {
                chrome_id:
                    state.chrome_id,
                group_id: state.modals.invite.group_id,
                invite_id: invite_id,
                action: "withdrawInvite"
            }
        };
        request( params).then(result => {
            state.modals.invite.data.users.push(user);
            update(state);
            actions.setInviteList({
                data: state.modals.invite.data.users,
                resetInvites: false
            });
        });
    };
};

export const sendInvites = (state, actions) => {
    let data = invites.map(user => {
        return user.id;
    });

    return update => {
        let params = {
            queryParams: {
                chrome_id:
                    state.chrome_id,
                group_id: state.modals.invite.group_id,
                users: JSON.stringify(data),
                action: "sendInvites"
            }
        };
        request( params).then(result => {
            state.modals.invite.open = false;
            update(state);
        });
    };
};

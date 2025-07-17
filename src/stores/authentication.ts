/* Copyright 2025 Esri
 *
 * Licensed under the Apache License Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Portal from "@arcgis/core/portal/Portal"
import { action, makeObservable, observable } from "mobx"
import { applicationId, portalUrl } from "../config"
import OAuthInfo from "@arcgis/core/identity/OAuthInfo"
import IdentityManager from "@arcgis/core/identity/IdentityManager"

interface UserInfo {
    signedIn: boolean
    userName: string
    fullName: string
    email: string
    thumbnailUrl: string
}

class AppAuthentication {
    userInfo: UserInfo = {
        signedIn: false,
        userName: null,
        fullName: null,
        email: null,
        thumbnailUrl: null
    }

    constructor() {
        makeObservable(this, {
            userInfo: observable,
            setUserInfo: action
        });
        this.setupIdentityManager();
    }

    setUserInfo(userInfo: UserInfo) {
        if (userInfo) {
            this.userInfo = userInfo;
        } else {
            this.userInfo = {
                signedIn: false,
                userName: null,
                fullName: null,
                email: null,
                thumbnailUrl: null
            }
        }

    }

    async setupIdentityManager() {
        const portal = new Portal({ url: portalUrl });
        const authInfo = new OAuthInfo({
            appId: applicationId,
            flowType: 'auto',
            popup: false,
            portalUrl
        });
        IdentityManager.registerOAuthInfos([authInfo]);

        try {
            await IdentityManager.checkSignInStatus(authInfo.portalUrl + '/sharing');
            await portal.load();
            this.setUserInfo({
                signedIn: true,
                userName: portal.user?.username,
                fullName: portal.user?.fullName,
                email: portal.user?.email,
                thumbnailUrl: portal.user?.thumbnailUrl
            });
        } catch (error) {
            // console.log(error);
        }
    }

    signIn() {
        IdentityManager.getCredential(portalUrl + '/sharing');
    }

    signOut() {
        IdentityManager.destroyCredentials();
        window.location.reload();
        this.setUserInfo(null);
    }
}

const auth = new AppAuthentication();
export default auth;
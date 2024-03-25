/* global Sentry */

import { createBrowserHistory } from 'history';
import React, { useEffect } from 'react';

import { useHistory } from "react-router";
import { render } from 'react-dom';
import { Router } from 'react-router-dom';
import { initSentry } from "../config/Sentry";
import { ApiProvider, useAPI } from '../providers/ApiProvider';
import { AppStoreProvider } from '../providers/AppStoreProvider';
import { ConfigProvider } from '../providers/ConfigProvider';
import { LibraryProvider } from '../providers/LibraryProvider';
import { MultiProvider } from '../providers/MultiProvider';
import { ProjectProvider } from '../providers/ProjectProvider';
import { RoutesProvider } from '../providers/RoutesProvider';
import { DRAFT_GUARD_KEY, DraftGuard, draftGuardCallback } from "../components/DraftGuard/DraftGuard";
import './App.styl';
import { AsyncPage } from './AsyncPage/AsyncPage';
import ErrorBoundary from './ErrorBoundary';
import { RootPage } from './RootPage';
import { FF_OPTIC_2, isFF } from '../utils/feature-flags';
import { ToastProvider, ToastViewport } from '../components/Toast/Toast';
import { ParticleNetwork, WalletEntryPosition } from "@particle-network/auth";
import { SolanaWallet } from "@particle-network/solana-wallet";
import { Solana } from "@particle-network/chains";

const particle = new ParticleNetwork({
  projectId: "fce154d4-09cf-4db8-9345-74ade629fa85",
  clientKey: "c1f60QizVV9JoAJaQlwbk8TswsTNs4g1Ega1ZLM9",
  appId: "f0103567-ad66-4ec6-b947-dfe0d3076bca",
  wallet: {   //optional: by default, the wallet entry is displayed in the bottom right corner of the webpage.
    displayWalletEntry: true,  //show wallet entry when connect particle.
    defaultWalletEntryPosition: WalletEntryPosition.BR, //wallet entry position
    uiMode: "light",
    supportChains: [Solana], // optional: web wallet support chains.
    customStyle: {}, //optional: custom wallet style
  },
  // securityAccount: { //optional: particle security account config
  //   //prompt set payment password. 0: None, 1: Once(default), 2: Always
  //   promptSettingWhenSign: 1,
  //   //prompt set master password. 0: None(default), 1: Once, 2: Always
  //   promptMasterPasswordSettingWhenLogin: 1
  // },
});


const baseURL = new URL(APP_SETTINGS.hostname || location.origin);

const browserHistory = createBrowserHistory({
  basename: baseURL.pathname || "/",
  getUserConfirmation: (message, callback) => {
    if (isFF(FF_OPTIC_2) && message === DRAFT_GUARD_KEY) {
      draftGuardCallback.current = callback;
    } else {
      callback(window.confirm(message));
    }
  },
});

window.LSH = browserHistory;

initSentry(browserHistory);
const login = async (api, history) => {
  let userInfo;

  if (!particle.auth.isLogin()) {
    userInfo = await particle.auth.login();
  } else {
    userInfo = particle.auth.getUserInfo();
  }
  const res = await api.callApi('signup', {
    body: {
      user: {
        email: userInfo.google_email,
        password: 'asdfdsgdf3424543',
      },
    },
  });
  
  console.log('res: ', res);
  if (res.success) {
    location.reload();
  }
  return userInfo;
};
const Login = () => {
  const api = useAPI();


  const history = useHistory();

  return (<>
    <button onClick={() => login(api, history)}>Login</button>
  </>)
}

const App = ({ content }) => {
  console.log(location)
  if (location.pathname.startsWith('/user/login')) {
    return (<MultiProvider providers={[
      <ApiProvider key="api" />,
    ]}>
      <Login />
    </MultiProvider>)
  }
  const libraries = {
    lsf: {
      scriptSrc: window.EDITOR_JS,
      cssSrc: window.EDITOR_CSS,
      checkAvailability: () => !!window.LabelStudio,
    },
    dm: {
      scriptSrc: window.DM_JS,
      cssSrc: window.DM_CSS,
      checkAvailability: () => !!window.DataManager,
    },
  };

  return (
    <ErrorBoundary>
      <Router history={browserHistory}>
        <MultiProvider providers={[
          <AppStoreProvider key="app-store" />,
          <ApiProvider key="api" />,
          <ConfigProvider key="config" />,
          <LibraryProvider key="lsf" libraries={libraries} />,
          <RoutesProvider key="rotes" />,
          <ProjectProvider key="project" />,
          <ToastProvider key="toast" />,
        ]}>
          <AsyncPage>
            <DraftGuard />
            <RootPage content={content} />
            <ToastViewport />
          </AsyncPage>
        </MultiProvider>
      </Router>
    </ErrorBoundary>
  );
};

const root = document.querySelector('.app-wrapper');
const content = document.querySelector('#main-content');

render(<App content={content.innerHTML} />, root);

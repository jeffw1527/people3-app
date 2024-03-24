import { Auth } from './Auth';

export const AuthPage  = (props) => {
  return (
    <div className="some-extra-class">
			ddddd
    </div>
  )
}

AuthPage.title = "Auth";
AuthPage.path = "/user/login"
AuthPage.pages = {
	Auth,
}
// Auth.exact = true

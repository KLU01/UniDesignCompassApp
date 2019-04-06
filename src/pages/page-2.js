import React from "react"
import {SignIn} from "aws-amplify-react";
import config from "../aws-exports";
import { CustomSignIn } from "./CustomSignIn";
import {Authenticator} from "aws-amplify-react/dist/Auth"
class sec extends React.Component{
  render(){
    return(
      <Authenticator hide={[SignIn]} amplifyConfig={config}>
        <CustomSignIn/>
      </Authenticator>
    )
  }
}

export default sec

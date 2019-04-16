import React from "react"
import renderer from "react-test-renderer"
import Login from "../../pages/Login";
import { store } from "../../state/store";
import { Provider } from 'react-redux';
import {configure} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {mount} from 'enzyme';
import {mountToJson} from 'enzyme-to-json';
configure({adapter:new Adapter()});

const tree = mount(<Provider store={store} ><Login /></Provider>);

describe("Login_Page", () => {
    it("render", () => {
        expect(mountToJson(tree)).toMatchSnapshot()
    })
})
// describe("SignIn exceptions",() =>{
//      it("failed Log in",()=>{
//          console.log();
//         tree.find('[type="submit"]');
//      })
// })

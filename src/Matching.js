import React from 'react';
import SelectNumber from './SelectNumber';
import axios from 'axios';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

class Matching extends React.Component {

  constructor(props){
    super(props);
    this.state={
      code: "",
      sended_code: "",
      created_id: null,
      opponent_id: null,
      desc: "",
      is_find_opponent: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.sendMatchingCode = this.sendMatchingCode.bind(this);
    this.handleFindOpponent = this.handleFindOpponent.bind(this);
  }

  handleChange(e){
    const value=e.target.value;
    this.setState(prevState => {
      return {
        code: value
       };
    });
  }

  sendMatchingCode(e){
      e.preventDefault();
    if(this.state.sended_code!==this.state.code){
      if(this.state.code.length<=20){
        axios({
          method : "POST",
          url : process.env.REACT_APP_SERVER_URL+"/numbers/create",
          data : { my_number: "", opponent_number: "", code: this.state.code, call: 1 }
        })
        .then((response)=> {
          alert("送信されました");
          this.setState(prevState => {
            return {
              sended_code: response.data.code,
              created_id: response.data.id
             };
          });
        })
        .catch((error)=> {
          console.error('error');
        });
      } else {
        alert("送信に失敗しました。送信できるコードの文字数は20文字以下です。")
      }
    } else {
      alert("同じコードは送信できません");
    }
  }

  handleFindOpponent(){
    if(this.state.created_id!==null){
      axios({
        method: 'get',
        url: process.env.REACT_APP_SERVER_URL+'/numbers/get/'+this.state.created_id+'/'+this.state.code
      })
      .then((response)=> {
        console.log(response.data);
        if(response.data.length===0){
          this.setState(prevState => {
            return {
              desc: "対戦相手を探しています "
             };
          });
        } else if(response.data.length===1){
          this.setState(prevState => {
            return {
              opponent_id: response.data[0]["id"],
              desc: "対戦相手が見つかりました",
              is_find_opponent: true
             };
          });
        } else {
          this.setState(prevState => {
            return {
              desc: "同じコードが複数存在するので他のコードを入力してください"
             };
          });
        }
      })
      .catch((error)=> {
        console.log('error');
      });
    } else {
      alert("コードを送信してください")
    }
  }

  render() {
    let circle;
    if(this.state.desc==="対戦相手を探しています "){
      circle=<CircularProgress size={20}/>;
    }
    let data={my_id: this.state.created_id, opponent_id: this.state.opponent_id};
    if(this.state.is_find_opponent===false){
      return (
        <div>
          <p>対戦相手と共通のコードを入力してください</p>
          <form onSubmit={this.sendMatchingCode}>
            <TextField variant="outlined" value={this.state.code} label="コード" required onChange={this.handleChange} /><br/><br/>
            <Button type="submit" variant="outlined" color="primary" >送信</Button><br/><br/>
          </form>
          <Button　variant="outlined" color="secondary" onClick={this.handleFindOpponent} >対戦相手を探す</Button>
          <p>{this.state.desc}{circle}</p>
        </div>
      );
    } else {
      return(
        <SelectNumber from_matching_data={data} />
      );
    }
  }
}

export default Matching;

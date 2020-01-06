import React from 'react';
import Game from './Game';
import axios from 'axios';
import './SelectNumber.css';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

class GameStartButton extends React.Component {
  render() {
    return (
      <div>
        {this.props.is_start_game ? null : <Button variant="outlined" color="primary" {...this.props}>決定</Button>}
      </div>
    );
  }
}

class SelectNumber extends React.Component{

  constructor(props){
    super(props);
    this.state={
      my_id: this.props.from_matching_data.my_id,
      my_number: '',
      my_call: 1,
      opponent_id: this.props.from_matching_data.opponent_id,
      opponent_number: "",
      opponent_call: null,
      is_start_game: false,
      is_click_gamestartbutton: 0,
      desc: "",
      order: "あなたは後攻です"
    };
    this.handleUpdateMyNumberState = this.handleUpdateMyNumberState.bind(this);
    this.handleDeleteMyNumberState = this.handleDeleteMyNumberState.bind(this);
    this.handleGameStart = this.handleGameStart.bind(this);
  }

  handleUpdateMyNumberState(e){
    let mynu=this.state.my_number;
    if(mynu.length<3){
      let duplication_count=0;
      for(let m=0;m<mynu.length;m++){
        if(mynu.charAt(m)===e.currentTarget.value){
          duplication_count+=1;
        }
      }
      if(duplication_count===0){
        const update_my_number=this.state.my_number+e.currentTarget.value;
        /* document.getElementById(1).disabled = true; */
        this.setState(prevState => {
          return {
            my_number: update_my_number
           };
        });
      } else {
        alert("数字が重複しています")
      }
    } else {
      alert("数字は3桁までです")
    }
  }

  handleDeleteMyNumberState(e){
    /* const disabled_button_number=this.state.my_number.slice(-1);
    document.getElementById(disabled_button_number).disabled = false; */
    this.setState(prevState => {
      return {
        my_number: ""
       };
    });
  }

  updateMyNumber(){
    if(this.state.is_click_gamestartbutton===0){
      const modify={ my_number: this.state.my_number }
      axios
          .put(process.env.REACT_APP_SERVER_URL+'/numbers/update/' + this.state.my_id, modify)
          .then(res => {
              this.getOpponentData();
          })
          .catch(error => {
              console.error('error');
          });
    } else {
      this.getOpponentData();
    }
  }

  getOpponentData(){
    axios({
      method: 'get',
      url: process.env.REACT_APP_SERVER_URL+'/numbers/show/'+this.state.opponent_id
    })
    .then((response)=> {
      this.setState(prevState => {
        return {
          opponent_number: response.data.my_number,
          opponent_call: response.data.call
         };
      });
      this.decideOrder()
    })
    .catch((error)=> {
      console.error('error');
    });
  }

  decideOrder(){
    /* 相手が決定ボタンを押す前、つまり受け取ったdataのcallがdefaultの1の場合は、自分が先行、つまり自分のcallが0になる */
    if(this.state.opponent_call===1){
      const modify={ call: 0 }
      axios
          .put(process.env.REACT_APP_SERVER_URL+'/numbers/update/' + this.state.my_id, modify)
          .then(response => {
              this.setState(prevState => {
                return {
                  my_call: 0,
                  order: "あなたは先攻です"
                 };
              });
          })
          .catch(error => {
              console.error('error');
          });
    }
    this.confirmOpponentState()
  }

  confirmOpponentState(){
    /* 相手の数字、つまりstateのopponent_numberが3桁じゃない => 入力前 or 入力中 */
    if(this.state.opponent_number.length!==3){
      this.setState(prevState => {
        return {
          desc: "対戦相手が数字を選んでいます。お待ちください "
         };
      });
    } else {
      this.setState(prevState => {
        return {
          is_start_game: true
         };
      });
    }
    this.changeGameStartState();
  }

  changeGameStartState(){
    this.setState(prevState => {
      return {
        is_click_gamestartbutton: 1
       };
    });
  }

  handleGameStart(){
    if(this.state.my_number.length===3){
      this.updateMyNumber();
    } else {
      alert("数字を3桁入力してください");
    }
  }

  render(){
    console.log(this.state);
    let circle;
    if(this.state.desc==="対戦相手が数字を選んでいます。お待ちください "){
      circle=<CircularProgress size={20}/>;
    }
    let show_my_number=this.state.my_number ? this.state.my_number : null;
    let data={ my_id: this.state.my_id, opponent_id: this.state.opponent_id, opponent_number: this.state.opponent_number, my_call: this.state.my_call, order: this.state.order };
    if(this.state.is_start_game===false){
      return(
        <div>
          <p>対戦相手が見つかりました<br/>数字3桁を選んでください</p>
          <Button id="1" value="1" variant="outlined" color="primary" disabled={false} onClick={this.handleUpdateMyNumberState} >1</Button>　
          <Button id="2" value="2" variant="outlined" color="primary" disabled={false} onClick={this.handleUpdateMyNumberState} >2</Button>　
          <Button id="3" value="3" variant="outlined" color="primary" disabled={false} onClick={this.handleUpdateMyNumberState} >3</Button>　
          <Button id="4" value="4" variant="outlined" color="primary" disabled={false} onClick={this.handleUpdateMyNumberState} >4</Button>　
          <Button id="5" value="5" variant="outlined" color="primary" disabled={false} onClick={this.handleUpdateMyNumberState} >5</Button><br/><br/>
          <Button id="6" value="6" variant="outlined" color="primary" disabled={false} onClick={this.handleUpdateMyNumberState} >6</Button>　
          <Button id="7" value="7" variant="outlined" color="primary" disabled={false} onClick={this.handleUpdateMyNumberState} >7</Button>　
          <Button id="8" value="8" variant="outlined" color="primary" disabled={false} onClick={this.handleUpdateMyNumberState} >8</Button>　
          <Button id="9" value="9" variant="outlined" color="primary" disabled={false} onClick={this.handleUpdateMyNumberState} >9</Button>　
          <Button id="0" value="0" variant="outlined" color="primary" disabled={false} onClick={this.handleUpdateMyNumberState} >0</Button><br/><br/>
          <div className="flex-box_select_number">
            <div>
              <Button variant="outlined" color="secondary" onClick={this.handleDeleteMyNumberState} >クリア</Button>　
            </div>
            <div>
              <GameStartButton onClick={this.handleGameStart} is_start_game={this.state.is_start_game}/>
            </div>
          </div>
          <p>あなたの数字は　{show_my_number}</p>
          <p>{this.state.desc}{circle}</p>
        </div>
      );
    } else {
      return(
        <Game from_select_number_data={data} />
      );
    }
  }
}
export default SelectNumber;

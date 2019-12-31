import React from 'react';
import axios from 'axios';
import Button from '@material-ui/core/Button';
import './Game.css';

class ShowEatBite extends React.Component{
  render(){
    return(
      <div>
      CALL{this.props.from_game_data[0]}: {this.props.from_game_data[1]}　{this.props.from_game_data[2]}EAT　{this.props.from_game_data[3]}BITE
      </div>
    );
  }
}

class Game extends React.Component{

  constructor(props){
    super(props);
    this.state={
      my_id: this.props.from_select_number_data.my_id,
      my_call: this.props.from_select_number_data.my_call,
      opponent_id: this.props.from_select_number_data.opponent_id,
      opponent_number: this.props.from_select_number_data.opponent_number,
      opponent_call: null,
      selected_number: '',
      eat_count: null,
      bite_count: null,
      eat_bite: [],
      opponent_eat_bite: [],
      call_count: 1,
      order: this.props.from_select_number_data.order,
      result: 0,
      result_message: "あなたの負けです!"
    };
    this.handleSelect = this.handleSelect.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleCall = this.handleCall.bind(this);
    this.handleReload = this.handleReload.bind(this);
  }

  handleSelect(e){
    let mynu=this.state.selected_number;
    if(mynu.length<3){
      let duplication_count=0;
      for(let m=0;m<mynu.length;m++){
        if(mynu.charAt(m)===e.currentTarget.value){
          duplication_count+=1;
        }
      }
      if(duplication_count===0){
        const update_selected_number=this.state.selected_number+e.currentTarget.value;
        this.setState(prevState => {
          return {
            selected_number: update_selected_number
           };
        });
      } else {
        alert("数字が重複しています")
      }
    } else {
      alert("数字は3桁までです")
    }
  }

  handleDelete(){
    this.setState(prevState => {
      return {
        selected_number: ""
       };
    });
  }

  handleReload(){
    window.location.reload();
  }

  processCall(){
    /* call処理 */
    const c=this.state.opponent_number;
    const s=this.state.selected_number;
    let ec=0,bc=0;

    for(var i=1,cl=c.length;i<=cl;i++){
      if(c.includes(s.slice(i-1,i))){
        bc+=1;
        if(s.slice(i-1,i)===c.slice(i-1,i)){
          ec+=1;
          bc-=1;
        }
      }
    }

    const call_counter=String(this.state.call_count),now_selected_number=this.state.selected_number,ec_to_str=String(ec),bc_to_str=String(bc);
    let result_array=[call_counter,now_selected_number,ec_to_str,bc_to_str];
    let new_eat_bite=this.state.eat_bite;
    new_eat_bite.push(result_array);

    this.setState(prevState => {
      return {
        eat_count: ec,
        bite_count: bc,
        call_count: this.state.call_count+1,
        eat_bite: new_eat_bite
       };
    });
    this.updateMyCall();
  }

  updateMyCall(){
    /* 自分のcallを1に変える*/
    this.setState(prevState => {
      return {
        my_call: 1
       };
    });
    const my_modify={ call: 1 }
    axios
        .put('https://kwibong-hitblow-api.herokuapp.com/numbers/update/' + this.state.my_id, my_modify)
        .then(res => {
            this.updateOpponentCall();
        })
        .catch(error => {
            console.error('error');
        });
  }

  updateOpponentCall(){
    /* 相手のcallを0に変える*/
    const opponent_modify={ call: 0 }
    axios
        .put('https://kwibong-hitblow-api.herokuapp.com/numbers/update/' + this.state.opponent_id, opponent_modify)
        .then(res => {
            this.getOpponentEatBite();
        })
        .catch(error => {
            console.error('error');
        });
  }

  getOpponentEatBite(){
    /* 相手のeat,biteの取得、stateへの保存、call_countが1、つまりまだ一度もコールしていないときはやらん */
    axios({
      method: 'get',
      url: 'https://kwibong-hitblow-api.herokuapp.com/results/show/'+this.state.opponent_id
    })
    .then((response)=> {
      if(response.data.length!==0){
        let new_opponent_eat_bite=[];
        for(var k=0;k<response.data.length;k++){
          new_opponent_eat_bite.push([response.data[k].count, response.data[k].number, response.data[k].eat, response.data[k].bite]);
        }
        this.setState(prevState => {
          return {
            opponent_eat_bite: new_opponent_eat_bite
          };
        });
      }
      console.log(this.state);
      this.updateMyEatBite();
    })
    .catch((error)=> {
      console.error('error');
    });
  }

  updateMyEatBite(){
    /* 自分のeat,biteをdbに保存 */
    let result_data={
      number_id: this.state.my_id,
      count: String(this.state.call_count-1),
      number: this.state.selected_number,
      eat: String(this.state.eat_count),
      bite: String(this.state.bite_count)
    };
    axios
        .post('https://kwibong-hitblow-api.herokuapp.com/results/create', result_data)
        .then(res => {
          this.checkResult();
        })
        .catch(error => {
            console.error('error');
        });
    this.setState(prevState => {
      return {
        selected_number: ""
      };
    });
  }

  checkResult(){
    let opre=this.state.opponent_eat_bite;
    if(opre.length===0){
      if(this.state.eat_count===3){
        this.setState(prevState => {
          return {
            result: 1,
            result_message: "あなたの勝ちです!"
          };
        });
      }
    } else {
      if(this.state.eat_count===3){
        if(opre.slice(-1)[0][2]==='3'){
          /* 自分が先に勝った場合、myco>opco*/
          if(this.state.call_count>parseInt(opre.slice(-1)[0][0])){
            this.setState(prevState => {
              return {
                result: 1,
                result_message: "あなたの勝ちです!"
              };
            });
          }
        }
        this.setState(prevState => {
          return {
            result: 1,
            result_message: "あなたの勝ちです!"
          };
        });
      }
    }
  }

  handleCall(){
    /* selested_numberが空じゃない　かつ　opponent_numberと同じ長さの時だけcallできる*/
    if(this.state.selected_number!=="" && this.state.selected_number.length===this.state.opponent_number.length){

      /* 相手のcallを取得*/
      axios({
        method: 'get',
        url: 'https://kwibong-hitblow-api.herokuapp.com/numbers/show/'+this.state.opponent_id
      })
      .then((response)=> {
        /* 相手のcallが1 => call済み => 自分はcallできる*/
        if(response.data.call===1){
          this.processCall();
        } else {
          alert("相手のコールターンです。コールが終わるまでお待ちください。");
        }

      })
      .catch((error)=> {
        console.error('handlecallのエラー');
      });

    } else {
      alert("数字を3つ選択してください");
    }
  }

  render() {
    console.log(this.state);
    const show_selected_number=this.state.selected_number ? this.state.selected_number : null;
    let opponent_eat="";
    if(this.state.opponent_eat_bite.length!==0){
      opponent_eat=this.state.opponent_eat_bite.slice(-1)[0][2]
    }
    /* 自分も相手もeatが3じゃない、つまり勝敗がついていない場合 */
    if (this.state.eat_count!==3 && opponent_eat!=='3') {
      return (
        <div>
          <p>{this.state.order}</p>
          <p>相手の数字3桁を予想してください</p>
          <Button id="1" value="1" variant="outlined" color="primary" disabled={false} onClick={this.handleSelect} >1</Button>　
          <Button id="2" value="2" variant="outlined" color="primary" disabled={false} onClick={this.handleSelect} >2</Button>　
          <Button id="3" value="3" variant="outlined" color="primary" disabled={false} onClick={this.handleSelect} >3</Button>　
          <Button id="4" value="4" variant="outlined" color="primary" disabled={false} onClick={this.handleSelect} >4</Button>　
          <Button id="5" value="5" variant="outlined" color="primary" disabled={false} onClick={this.handleSelect} >5</Button><br/><br/>
          <Button id="6" value="6" variant="outlined" color="primary" disabled={false} onClick={this.handleSelect} >6</Button>　
          <Button id="7" value="7" variant="outlined" color="primary" disabled={false} onClick={this.handleSelect} >7</Button>　
          <Button id="8" value="8" variant="outlined" color="primary" disabled={false} onClick={this.handleSelect} >8</Button>　
          <Button id="9" value="9" variant="outlined" color="primary" disabled={false} onClick={this.handleSelect} >9</Button>　
          <Button id="0" value="0" variant="outlined" color="primary" disabled={false} onClick={this.handleSelect} >0</Button><br/><br/>
          <Button variant="outlined" color="secondary" onClick={this.handleDelete} >クリア</Button>　
          <Button variant="outlined" color="primary" onClick={this.handleCall} >コール</Button><br/><br/>

          <p>あなたが予想した相手の数字は {show_selected_number}</p>
          <p>{this.state.desc}</p>
          <div class="flex-box_game">
            <div class="flex-item_my_call">
              <span>あなたのコール結果</span>
              {this.state.eat_bite.map((data,i) => { return( <ShowEatBite from_game_data={ data } key={ i } /> )})}
            </div>
            <div class="flex-item_opponent_call">
              <span>相手のコール結果</span>
              {this.state.opponent_eat_bite.map((data,i) => { return( <ShowEatBite from_game_data={ data } key={ i } /> )})}
            </div>
          </div>
        </div>
      );
    } else {
      return(
        <div>
          <p>{this.state.result_message}</p>
          <p>相手の数字は　{this.state.opponent_number}　でした！</p>
          <Button variant="contained" color="primary" onClick={this.handleReload} >もう一度遊ぶ</Button>
          <div className="flex-box_game">
            <div>
              <p>あなたのコール結果</p>
              {this.state.eat_bite.map((data,i) => { return( <ShowEatBite from_game_data={ data } key={ i } /> )})}
            </div>
            <div>
              <p>相手のコール結果</p>
              {this.state.opponent_eat_bite.map((data,i) => { return( <ShowEatBite from_game_data={ data } key={ i } /> )})}
            </div>
          </div>
        </div>
      );
    }
  }
}

export default Game;

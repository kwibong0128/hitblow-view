import React from 'react';
import Matching from './Matching';
import './TopPage.css';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

class MatchingButton extends React.Component {
  render() {
    return (
      <div>
        {this.props.is_top_page_hide ? null : <Button variant="contained" color="primary" {...this.props}>ゲームスタート</Button>}
      </div>
    );
  }
}

class TopPage extends React.Component{

  constructor(props){
    super(props);
    this.state={
      is_top_page_hide: false
    };
    this.onClick = this.onClick.bind(this);
  }

  onClick(){
    this.setState(prevState => {
      return {
        is_top_page_hide: true
       };
    });
  }

  render() {
    return (
      <div className="toppage">
        <p>Hit&Blow</p>
        <MatchingButton onClick={this.onClick} is_top_page_hide={this.state.is_top_page_hide}/>
        {this.state.is_top_page_hide ? <Matching /> : null}<br/>
        {this.state.is_top_page_hide ? null :
          <Card className="" variant="outlined">
          <CardContent>
            <Typography color="textPrimary" gutterBottom>
              遊び方<br/>
              Hit&Blowは以下のような流れに従ってゲームが進行していきます。<br/>
              1.遊びたい相手と共通のコードを決めて入力する<br/>
              2.プレイヤー２人はそれぞれ３桁の数字を決める<br/>
              3.相手の数字をコール（予想）する　　　　　　<br/>
              あとは当たるまで3をプレイヤーで交互に行います。<br/>
              最初に数字を設定するときに、重複する3桁の数字（例えば556, 282など）は選べません。<br/><br/>
              EAT,BITEとは？<br/>
              自分がコールした数字の中で、位置も合っていたらEAT、位置は違うけど設定した数字の中にある場合はBITEとなります。<br/>
              例)相手が設定した数字が397、自分がコール（予想）した数字が794のとき<br/>
              1EAT, 1BITE<br/>
            </Typography>
          </CardContent>
        </Card>}
        <p className="footer">© 2019 KWIBONG</p>
      </div>
    );
  }
}

export default TopPage;

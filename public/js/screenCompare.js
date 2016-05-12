var data = [
	{"_id":"571e585593685419c1e23656",
	"type":"screenshot",
	"ssId":"571e585493685419c1e23654",
	"release":"20160427",
	"page":"LoopsPage",
	"classname":"createNewLoop",
	"testname":"onMyTeamDisplayed",
	"qename":"Sebas",
	"number":"1",
	"verified":false,
	"comment":""}
	]

var MainComponent = React.createClass({
  render: function() {
    return (
      <div>
        <ReleaseDropdown/>
        <PageDropdown/>
        <TestnameDropdown/>
        <SSBox/>
      </div>
    );
  }
})

var ReleaseDropdown = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    $.ajax({
      url: "/tools/releases",
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    return (
        <ReleaseList data={this.state.data} />
    );
  }
})

var ReleaseList = React.createClass({

  render: function() {
    var options = this.props.data.map(function(option) {
      return (
          <option key={option.value} value={option.value}>
              {option.value}
          </option>
      )
    });
    return (
      <select 
          onChange={this.handleChange} value={this.selected}>
        {options}
      </select>
    );
  },
  handleChange: function(e) {
    this.setState({selected: e.target.value})
    MainComponent.render;
  }
});

var PageDropdown = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    $.ajax({
      url: "/tools/pages",
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    return (
        <PageList data={this.state.data} />
    );
  }
})

var PageList = React.createClass({

  render: function() {
    var options = this.props.data.map(function(option) {
      return (
          <option key={option.value} value={option.value}>
              {option.value}
          </option>
      )
    });
    return (
      <select 
          onChange={this.handleChange}
          value={this.selected}>
        {options}
      </select>
    );
  },
  handleChange: function(e) {
    this.setState({selected: e.target.value})
  }
});

var ClassnameDropdown = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    $.ajax({
      url: "/tools/classnames",
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    return (
        <TNList data={this.state.data} />
    );
  }
})

var CNList = React.createClass({

  render: function() {
    var options = this.props.data.map(function(option) {
      return (
          <option key={option.value} value={option.value}>
              {option.value}
          </option>
      )
    });
    return (
      <select 
          onChange={this.handleChange}
          value={this.selected}>
        {options}
      </select>
    );
  },
  handleChange: function(e) {
    this.setState({selected: e.target.value})
  }
});

var TestnameDropdown = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    $.ajax({
      url: "/tools/testnames",
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    return (
        <TNList data={this.state.data} />
    );
  }
})

var TNList = React.createClass({

  render: function() {
    var options = this.props.data.map(function(option) {
      return (
          <option key={option.value} value={option.value}>
              {option.value}
          </option>
      )
    });
    return (
      <select 
          onChange={this.handleChange}
          value={this.selected}>
        {options}
      </select>
    );
  },
  handleChange: function(e) {
    this.setState({selected: e.target.value})
  }
});

var SSBox = React.createClass({
	getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    $.ajax({
      url: "/tools/screenshot",
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    return (
        <SSList data={this.state.data} />
    );
  }
});

var SSList = React.createClass({
  render: function() {
    var ssNodes = this.props.data.map(function(ss) {
    	var ssUrl = "../tools/screenshot/"+ss.ssId+"/download";
      return (
        <SS classname={ss.classname} key={ss.ssId} ssUrl={ssUrl} release={ss.release} page={ss.page} testname={ss.testname} qename={ss.qename} verified={ss.verified}/>
      );
    });
    return (
      <div className="SSList">
        {ssNodes}
      </div>
    );
  }
});

var SS = React.createClass({
  rawMarkup: function() {
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return { __html: rawMarkup };
  },
  render: function() {
    return (
      <div className="ss">
      	<div className = "ssContainer">
      		<h2 className = "labelContainer">{this.props.classname}</h2>
          <h2 className = "labelContainer">{this.props.release}</h2>
          <h2 className = "labelContainer">{this.props.page}</h2>
          <h2 className = "labelContainer">{this.props.testname}</h2>
          <h2 className = "labelContainer">{this.props.qename}</h2>
          <h2 className = "labelContainer">{this.props.verified}</h2>
        	<img className="ssImage" src={this.props.ssUrl} />
        </div>
      </div>
    );
  }
});

// var FruitSelector = React.createClass({
//     getInitialState:function(){
//         return {selectValue:'Orange'};
//     },
//     handleChange:function(e){
//         this.setState({selectValue:e.target.value});
//     },
//     render: function() {
//         var message='You selected '+this.state.selectValue;
//         return (
//         <div>
//          <select value={this.state.selectValue} 
//          onChange={this.handleChange} 
//          >
//             <option value="Orange">Orange</option>
//             <option value="Radish">Radish</option>
//             <option value="Cherry">Cherry</option>
//           </select>
//           <p>{message}</p>
//           </div>        
//         );
//     }
// });


ReactDOM.render(
  <MainComponent/>,
  document.getElementById('content')
);


 

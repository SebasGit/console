var data = [{
  "_id":"571e585593685419c1e23656",
  "type":"screenshot",
  "ssId":"571e585493685419c1e23654",
  "release":"20160427",
  "page":"LoopsPage",
  "classname":"createNewLoop",
  "testname":"onMyTeamDisplayed",
  "qename":"Sebas",
  "number":"1",
  "verified":false,
  "comment":""
}];

var MainComponent = React.createClass({
  getInitialState: function() {
    return {
      selectedRelease: "All Releases", 
      selectedPage: "All Pages", 
      selectedTest: "All Tests", 
      data: data
    };
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
  onReleaseSelected: function(release) {
    this.setState({ selectedRelease: release });
  },
  onPageSelected: function(page) {
    this.setState({ selectedPage: page });
  },
  onTestSelected: function(test) {
    this.setState({ selectedTest: test })
  },
  render: function() {
    return (
      <div>
        <ReleaseDropdown onReleaseSelected={this.onReleaseSelected} />
        <PageDropdown onPageSelected={this.onPageSelected} />
        <TestNameDropdown onTestSelected={this.onTestSelected} />
        <ScreenShotBox selectedRelease={this.state.selectedRelease} selectedPage={this.state.selectedPage} selectedTest={this.state.selectedTest} data={this.state.data} />
      </div>
    );
  }
});

var ReleaseDropdown = React.createClass({
  getInitialState: function() {
    return {
      data: [], 
      onReleaseSelected: this.props.onReleaseSelected
    };
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
        <ReleaseList data={this.state.data} onReleaseSelected={this.state.onReleaseSelected}/>
    );
  }
})

var ReleaseList = React.createClass({
  handleChange: function(e) {
    this.props.onReleaseSelected(e.target.value);
    this.setState({selected: e.target.value});
  },
  render: function() {
    var that = this;
    var options = this.props.data.map(function(option) {
      return (
          <option key={option.value} value={option.value}>
              {option.value}
          </option>
      )
    });

    return (
      <select onChange={this.handleChange} value={this.selected}>
        {options}
      </select>
    );
  }
});

var PageDropdown = React.createClass({
  getInitialState: function() {
    return {
      data: [], 
      onPageSelected: this.props.onPageSelected
    };
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
        <PageList data={this.state.data} onPageSelected={this.state.onPageSelected} />
    );
  }
})

var PageList = React.createClass({
  handleChange: function(e) {
    this.props.onPageSelected(e.target.value);
    this.setState({selected: e.target.value})
  },
  render: function() {
    var options = this.props.data.map(function(option) {
      return (
          <option key={option.value} value={option.value} onClick={function() {that.props.onClick(option.value)}}>
              {option.value}
          </option>
      )
    });
    return (
      <select onChange={this.handleChange} value={this.selected}>
        {options}
      </select>
    );
  }
});

var TestNameDropdown = React.createClass({
  getInitialState: function() {
    return {
        data: [], 
        onTestSelected: this.props.onTestSelected
    };
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
        <TestNameList data={this.state.data} onTestSelected={this.state.onTestSelected} />
    );
  }
})

var TestNameList = React.createClass({
  handleChange: function(e) {
    this.props.onTestSelected(e.target.value);
    this.setState({selected: e.target.value})
  },
  render: function() {
    var options = this.props.data.map(function(option) {
      return (
          <option key={option.value} value={option.value}>
              {option.value}
          </option>
      )
    });

    return (
      <select onChange={this.handleChange} value={this.selected}>
        {options}
      </select>
    );
  }
});

var ScreenShotBox = React.createClass({
  render: function() {
    return (
        <SSList data={this.props.data} selectedTest={this.props.selectedTest} selectedRelease={this.props.selectedRelease} selectedPage={this.props.selectedPage}/>
    );
  }
});

var SSList = React.createClass({
  render: function() {
    var { 
      selectedRelease, 
      selectedPage, 
      selectedTest, 
      data 
    } = this.props;

    var ssNodes = data.reduce((prev, ss) => {
      if ((ss.release == selectedRelease || selectedRelease == "All Releases") && (ss.page == selectedPage || selectedPage == "All Pages") && (ss.testname == selectedTest || selectedTest == "All Tests")) {
        var ssUrl = `../tools/screenshot/${ss.ssId}/download`;
        var ssLastVerifiedUrl = `../tools/screenshot/lastverified?testname=${ss.testname}+classname=${ss.classname}`;

        var screenshot = (
          <SS classname={ss.classname} key={ss.ssId} ssUrl={ssUrl} ssLastVerifiedUrl={ssLastVerifiedUrl} release={ss.release} page={ss.page} testname={ss.testname} qename={ss.qename} verified={ss.verified}/>
        );

        prev.push(screenshot);
      }

      return prev;
    }, [])

    return (
      <div className="SSList">
        {ssNodes}
      </div>
    );
  }
});

var SS = React.createClass({
  getInitialState: function() {
    return {
      ssLastVerifiedUrl: this.props.ssLastVerifiedUrl,
      ssComparisonUrl: this.props.comparisonUrl || ''
    }
  },
  render: function() {
    const ssLastVerifiedUrl = this.state.ssLastVerifiedUrl;
    const ssComparisonUrl = this.state.ssComparisonUrl;
    const Header = (props) => {
      return (
        <h2 className="labelContainer">{props.value}</h2>
      )
    };
    const Image = (props) => {
      return (
        <img className="ssImage" src={props.src} onError={props.onError} />
      )
    }

    return (
      <div className="ss">
        <Header value={this.props.release} />
        <Header value={this.props.release} />
        <Header value={this.props.classname} />
        <Header value={this.props.page} />
        <Header value={this.props.testname} />
        <Header value={this.props.qename} />
        <Header value={this.props.verified} />
        <div className="ssContainer">
          <Image src={this.props.ssUrl} />
          <Image src={ssLastVerifiedUrl} onError={() => {
            this.setState({
              ssLastVerifiedUrl: "404.gif"
            })
          }.bind(this)} />
          <Image src={ssComparisonUrl} onError={() => {
            this.setState({
              ssComparisonUrl: "404.gif"
            })
          }.bind(this)} />
        </div>
      </div>

    );
  }
});

ReactDOM.render(
  <MainComponent/>,
  document.getElementById('content')
);
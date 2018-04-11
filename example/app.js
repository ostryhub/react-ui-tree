import '../lib/react-ui-tree.less';
import './theme.less';
import './app.less';
import cx from 'classnames';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Tree from '../lib/react-ui-tree.js';
import tree from './tree';
import packageJSON from '../package.json';

var tree2 = deepCopy(tree);

function deepCopy(obj) {
  var json = JSON.stringify(obj);
  var copy = JSON.parse(json);
  return copy;
}

class App extends Component {

  state = {
    active: null,
    tree: tree,
    tree2: tree2
  };

  renderNode = (node, index) => {
    return (
      <span
        className={cx('node', {
          'is-active': node === this.state.active
        })}
        onClick={this.onClickNode.bind(null, node)}
      >
        [{index ? index.id : "no id"}] {node.module}
      </span>
    );
  };

  onClickNode = node => {
    this.setState({
      active: node
    });
  };

  render() {
    return (
      <div className="app">
        <div className="tree">
          <Tree
            treeName={"First"}
            paddingLeft={20}
            tree={this.state.tree}
            onChange={this.handleChange}
            isNodeCollapsed={this.isNodeCollapsed}
            isNodeReorderEnabled={true}
            renderNode={this.renderNode}
          />
        </div>

        <div id="secondTree" className="tree">
          <Tree
            treeName={"Second"}
            paddingLeft={20}
            tree={this.state.tree2}
            onChange={this.handleChange2}
            isNodeCollapsed={this.isNodeCollapsed}
            isNodeReorderEnabled={false}
            renderNode={this.renderNode}
          />
        </div>

        <div className="inspector">
          <h1>
            {packageJSON.name} {packageJSON.version}
          </h1>
          // <button onClick={this.updateTree}>update tree</button>
          <pre>{JSON.stringify(this.state.tree, null, '  ')}</pre>
        </div>
      </div>
    );
  }

  handleChange = tree => {
    this.setState({
      tree: tree
    });
  };

  handleChange2 = tree => {
    this.setState({
      tree2: tree
    });
  };

  updateTree = () => {
    const { tree, tree2 } = this.state;
    tree.children.push({ module: 'test' });

    this.setState({
      tree: tree,
      tree2: tree2

    });
  };
}

ReactDOM.render(<App />, document.getElementById('app'));

import cx from 'classnames';
import React, { Component } from 'react';

class UITreeNode extends Component {
  renderCollapse = () => {
    const { index } = this.props;

    if (index.children && index.children.length) {
      const { collapsed } = index.node;

      return (
        <span
          className={cx('collapse', collapsed ? 'caret-right' : 'caret-down')}
          onMouseDown={e => e.stopPropagation()}
          onClick={this.handleCollapse}
        />
      );
    }

    return null;
  };

  renderChildren = () => {

    const { index, tree, dragging } = this.props;

    if (index.children && index.children.length) {
      const childrenStyles = {
        paddingLeft: this.props.paddingLeft
      };

      return (
        <div className="children" style={childrenStyles}>
          {index.children.map(child => {
            const childIndex = tree.getIndex(child);

            return (
              <UITreeNode
                tree={tree}
                index={childIndex}
                key={childIndex.id}
                dragging={dragging}
                paddingLeft={this.props.paddingLeft}
                onCollapse={this.props.onCollapse}
                onDragStart={this.props.onDragStart}
              />
            );
          })}
        </div>
      );
    }

    return null;
  };

  render() {
    const { tree, index, dragging } = this.props;
    const { node } = index;
    const styles = {};

    return (
      <div
        className={cx('m-node', {
          placeholder: index.id === dragging
        })}
        style={styles}
      >
        <div className="inner" ref="inner"
         // onMouseDown={this.handleMouseDown}
         draggable={true}
         onDragStart={this.html_onDragStart.bind(this)}
         >
          {this.renderCollapse()}
          {tree.renderNode(node, index)}
        </div>
        {node.collapsed ? null : this.renderChildren()}
      </div>
    );
  }

  handleCollapse = e => {
    e.stopPropagation();
    const nodeId = this.props.index.id;

    if (this.props.onCollapse) {
      this.props.onCollapse(nodeId);
    }
  };

  handleMouseDown = e => {
    const nodeId = this.props.index.id;
    const dom = this.refs.inner;

    const node = this.props.tree.getIndex(nodeId).node;

    var dragData = {
      nodeId: nodeId,
      node: node
    };

    if (this.props.onDragStart) {
      this.props.onDragStart(nodeId, dom, e);
    }

    return dragData;
  };

  html_onDragStart = e => {
    var dragData = this.handleMouseDown(e);
    var jsonData = JSON.stringify(dragData);
    e.dataTransfer.setData("text/rect-ui-tree", jsonData);

    this.printDropData("html_onDragStart", e);
  }

  printDropData(where, e)
  {
    // var dragData = e.dataTransfer.getData("text/plain");
    // console.log("printDropData "+where+", dragData: ", dragData, " e.target: ", e.target);
  }
}

module.exports = UITreeNode;

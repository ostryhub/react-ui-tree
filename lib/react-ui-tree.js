import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tree from './tree';
import UITreeNode from './node';
import uuidv1 from 'uuid/v1';

class UITree extends Component {
  static propTypes = {
    tree: PropTypes.object.isRequired,
    paddingLeft: PropTypes.number,
    renderNode: PropTypes.func.isRequired
  };

  static defaultProps = {
    paddingLeft: 20
  };

  constructor(props) {
    super(props);
    this._uuid = uuidv1();
    this.state = this.init(props);
  }

  componentWillReceiveProps(nextProps) {
    if (!this._updated) {
      this.setState(this.init(nextProps));
    } else {
      this._updated = false;
    }
  }

  init = props => {
    const tree = new Tree(props.tree);
    tree.isNodeCollapsed = props.isNodeCollapsed;
    tree.renderNode = props.renderNode;
    tree.changeNodeCollapsed = props.changeNodeCollapsed;
    tree.updateNodesPosition();

    let nodeReorderEnabled = !!props.isNodeReorderEnabled;

    return {
      uuid: this._uuid,
      tree: tree,
      isNodeReorderEnabled: nodeReorderEnabled,
      dragging: {
        id: null,
        x: null,
        y: null,
        w: null,
        h: null
      }
    };
  };

  copyTree = tree => {
    var treeObj = JSON.parse(JSON.stringify(tree.obj));

    const newTree = new Tree(treeObj);
    newTree.isNodeCollapsed = tree.isNodeCollapsed;
    newTree.renderNode = tree.renderNode;
    newTree.changeNodeCollapsed = tree.changeNodeCollapsed;
    newTree.updateNodesPosition();
    return newTree;
  }

  getUUID() {
    return this.state.uuid;
  }

  getDraggingDom = () => {
    const { tree, dragging } = this.state;

    if (dragging && dragging.id) {
      const draggingIndex = tree.getIndex(dragging.id);
      const draggingStyles = {
        top: dragging.y,
        left: dragging.x,
        width: dragging.w
      };

      return (
        <div className="m-draggable" style={draggingStyles}>
          <UITreeNode
            tree={tree}
            index={draggingIndex}
            paddingLeft={this.props.paddingLeft}
            getParentUUID={this.getUUID.bind(this)}
          />
        </div>
      );
    }

    return null;
  };

  render() {
    const tree = this.state.tree;
    const draggingDom = this.getDraggingDom();

    return (
      <div className="m-tree" ref="treeContainer"
        onDrop={this.html_onDrop.bind(this)}
        onDragOver={this.html_onDragOver.bind(this)}
      >
        {draggingDom}
        <UITreeNode
          tree={tree}
          getParentUUID={this.getUUID.bind(this)}
          index={tree.getIndex(1)}
          key={1}
          paddingLeft={this.props.paddingLeft}
          onDragStart={this.dragStart}
          onCollapse={this.toggleCollapse}
          dragging={this.isDragging}
        />
      </div>
    );
  }

  isInside(e)
  {
    var elem = this.refs.treeContainer;
    var rect = elem.getBoundingClientRect();

    let x = e.clientX;
    let y = e.clientY;

    return x >= rect.left && x < rect.right &&
           y >= rect.top && y < rect.bottom;
  }

  html_onDragOver = e => {
      e.preventDefault();
  }

  html_onDrop = e => {
    e.preventDefault();

    var dragDataJson = e.dataTransfer.getData("text/rect-ui-tree");
    if (!dragDataJson)
    {
      console.log("No d&d react-ui-tree data found.");
      return;
    }

    var dragData = JSON.parse(dragDataJson);

    if (dragData.uuid == this.state.uuid)
      return;

    let node = dragData.node;

    if (!this.isDragging)
    {
      let tree = this.state.tree;
      tree.insert(node, 1, 0);
      this.setState({
        tree: tree
      });

      this.printDropData("html_onDrop", e);
    }
  }

  printDropData(where, e)
  {
    // var dragData = e.dataTransfer.getData("text/plain");
    // console.log("tree printDropData "+where+", dragData: ", dragData, " e.target: ", e.target);
  }

  get isDragging() { return this.state.dragging && this.state.dragging.id; }

  dragStart = (id, dom, e) => {

    console.log("this.state.isNodeReorderEnabled: ",this.state.isNodeReorderEnabled)
    if (this.state.isNodeReorderEnabled == false)
      return;

    this.dragAndDropActive = true;

    this.dragging = {
      id: id,
      w: dom.offsetWidth,
      h: dom.offsetHeight,
      x: dom.offsetLeft,
      y: dom.offsetTop
    };

    this.treeBeforeStartDrag = this.copyTree(this.state.tree);

    this._startX = dom.offsetLeft;
    this._startY = dom.offsetTop;
    this._offsetX = e.clientX;
    this._offsetY = e.clientY;
    this._draggingStarted = true;

    e.target.addEventListener('drag', this.drag);
    e.target.addEventListener('dragend', this.dragEnd);
  };

  // oh
  drag = e => {

    if (!this.isInside(e))
    {
      this.dragCancel(e);
      return;
    }

    if (this._draggingStarted) {
      this.setState({
        dragging: this.dragging
      });
      this._draggingStarted = false;
    }

    const tree = this.state.tree;
    const dragging = this.state.dragging;
    const paddingLeft = this.props.paddingLeft;

    let newIndex = null;
    let index = tree.getIndex(dragging.id);
    const collapsed = index.node.collapsed;

    const _startX = this._startX;
    const _startY = this._startY;
    const _offsetX = this._offsetX;
    const _offsetY = this._offsetY;

    const pos = {
      x: _startX + e.clientX - _offsetX,
      y: _startY + e.clientY - _offsetY
    };
    dragging.x = pos.x;
    dragging.y = pos.y;

    const diffX = dragging.x - paddingLeft / 2 - (index.left - 2) * paddingLeft;
    const diffY = dragging.y - dragging.h / 2 - (index.top - 2) * dragging.h;

    if (diffX < 0) {
      // left
      if (index.parent && !index.next) {
        newIndex = tree.move(index.id, index.parent, 'after');
      }
    } else if (diffX > paddingLeft) {
      // right
      if (index.prev) {
        const prevNode = tree.getIndex(index.prev).node;
        if (!prevNode.collapsed && !prevNode.leaf) {
          newIndex = tree.move(index.id, index.prev, 'append');
        }
      }
    }

    if (newIndex) {
      index = newIndex;
      newIndex.node.collapsed = collapsed;
      dragging.id = newIndex.id;
    }

    if (diffY < 0) {
      // up
      const above = tree.getNodeByTop(index.top - 1);
      newIndex = tree.move(index.id, above.id, 'before');
    } else if (diffY > dragging.h) {
      // down
      if (index.next) {
        const below = tree.getIndex(index.next);
        if (below.children && below.children.length && !below.node.collapsed) {
          newIndex = tree.move(index.id, index.next, 'prepend');
        } else {
          newIndex = tree.move(index.id, index.next, 'after');
        }
      } else {
        const below = tree.getNodeByTop(index.top + index.height);
        if (below && below.parent !== index.id) {
          if (
            below.children &&
            below.children.length &&
            !below.node.collapsed
          ) {
            newIndex = tree.move(index.id, below.id, 'prepend');
          } else {
            newIndex = tree.move(index.id, below.id, 'after');
          }
        }
      }
    }

    if (newIndex) {
      newIndex.node.collapsed = collapsed;
      dragging.id = newIndex.id;
    }

    this.setState({
      tree: tree,
      dragging: dragging
    });
  };

  dragEnd = (e) => {
    this.setState({
      dragging: {
        id: null,
        x: null,
        y: null,
        w: null,
        h: null
      }
    });

    this.notifyTreeChanged(this.state.tree);

    e.target.removeEventListener('drag', this.drag);
    e.target.removeEventListener('dragend', this.dragEnd);
  };

  dragCancel = (e) => {
    e.target.removeEventListener('drag', this.drag);
    e.target.removeEventListener('dragend', this.dragEnd);

    if (this.treeBeforeStartDrag != null)
    {
      let newTree = this.treeBeforeStartDrag;
      this.treeBeforeStartDrag = null;

      this.setState({
        tree: newTree,
        dragging: {
          id: null,
          x: null,
          y: null,
          w: null,
          h: null
        }
      });

      this.notifyTreeChanged(newTree);
    }
  };

  notifyTreeChanged = tree => {
    this._updated = true;
    if (this.props.onChange) this.props.onChange(tree.obj);
  };

  toggleCollapse = nodeId => {
    const tree = this.state.tree;
    const index = tree.getIndex(nodeId);
    const node = index.node;
    node.collapsed = !node.collapsed;
    tree.updateNodesPosition();

    this.setState({
      tree: tree
    });

    this.notifyTreeChanged(tree);
  };
}

module.exports = UITree;

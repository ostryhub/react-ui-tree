'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _tree = require('./tree');

var _tree2 = _interopRequireDefault(_tree);

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

var _v = require('uuid/v1');

var _v2 = _interopRequireDefault(_v);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UITree = function (_Component) {
  _inherits(UITree, _Component);

  function UITree(props) {
    _classCallCheck(this, UITree);

    var _this = _possibleConstructorReturn(this, (UITree.__proto__ || Object.getPrototypeOf(UITree)).call(this, props));

    _initialiseProps.call(_this);

    _this._uuid = (0, _v2.default)();
    _this.state = _this.init(props);
    return _this;
  }

  _createClass(UITree, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (!this._updated) {
        this.setState(this.init(nextProps));
      } else {
        this._updated = false;
      }
    }
  }, {
    key: 'getUUID',
    value: function getUUID() {
      return this.state.uuid;
    }
  }, {
    key: 'render',
    value: function render() {
      var tree = this.state.tree;
      var draggingDom = this.getDraggingDom();

      return _react2.default.createElement(
        'div',
        { className: 'm-tree', ref: 'treeContainer',
          onDrop: this.html_onDrop.bind(this),
          onDragOver: this.html_onDragOver.bind(this)
        },
        draggingDom,
        _react2.default.createElement(_node2.default, {
          tree: tree,
          getParentUUID: this.getUUID.bind(this),
          index: tree.getIndex(1),
          key: 1,
          paddingLeft: this.props.paddingLeft,
          onDragStart: this.dragStart,
          onCollapse: this.toggleCollapse,
          dragging: this.isDragging
        })
      );
    }
  }, {
    key: 'isInside',
    value: function isInside(e) {
      var elem = this.refs.treeContainer;
      var rect = elem.getBoundingClientRect();

      var x = e.clientX;
      var y = e.clientY;

      return x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom;
    }
  }, {
    key: 'printDropData',
    value: function printDropData(where, e) {
      // var dragData = e.dataTransfer.getData("text/plain");
      // console.log("tree printDropData "+where+", dragData: ", dragData, " e.target: ", e.target);
    }
  }, {
    key: 'isDragging',
    get: function get() {
      return this.state.dragging && this.state.dragging.id;
    }

    // oh

  }]);

  return UITree;
}(_react.Component);

UITree.propTypes = {
  tree: _propTypes2.default.object.isRequired,
  paddingLeft: _propTypes2.default.number,
  renderNode: _propTypes2.default.func.isRequired
};
UITree.defaultProps = {
  paddingLeft: 20
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.init = function (props) {
    var tree = new _tree2.default(props.tree);
    tree.isNodeCollapsed = props.isNodeCollapsed;
    tree.renderNode = props.renderNode;
    tree.changeNodeCollapsed = props.changeNodeCollapsed;
    tree.updateNodesPosition();

    var nodeReorderEnabled = !!props.isNodeReorderEnabled;

    return {
      uuid: _this2._uuid,
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

  this.copyTree = function (tree) {
    var treeObj = JSON.parse(JSON.stringify(tree.obj));

    var newTree = new _tree2.default(treeObj);
    newTree.isNodeCollapsed = tree.isNodeCollapsed;
    newTree.renderNode = tree.renderNode;
    newTree.changeNodeCollapsed = tree.changeNodeCollapsed;
    newTree.updateNodesPosition();
    return newTree;
  };

  this.getDraggingDom = function () {
    var _state = _this2.state,
        tree = _state.tree,
        dragging = _state.dragging;


    if (dragging && dragging.id) {
      var draggingIndex = tree.getIndex(dragging.id);
      var draggingStyles = {
        top: dragging.y,
        left: dragging.x,
        width: dragging.w
      };

      return _react2.default.createElement(
        'div',
        { className: 'm-draggable', style: draggingStyles },
        _react2.default.createElement(_node2.default, {
          tree: tree,
          index: draggingIndex,
          paddingLeft: _this2.props.paddingLeft,
          getParentUUID: _this2.getUUID.bind(_this2)
        })
      );
    }

    return null;
  };

  this.html_onDragOver = function (e) {
    e.preventDefault();
  };

  this.html_onDrop = function (e) {
    e.preventDefault();

    var dragDataJson = e.dataTransfer.getData("text/rect-ui-tree");
    if (!dragDataJson) {
      console.log("No d&d react-ui-tree data found.");
      return;
    }

    var dragData = JSON.parse(dragDataJson);

    if (dragData.uuid == _this2.state.uuid) return;

    var node = dragData.node;

    if (!_this2.isDragging) {
      var tree = _this2.state.tree;
      tree.insert(node, 1, 0);
      _this2.setState({
        tree: tree
      });

      _this2.printDropData("html_onDrop", e);
    }
  };

  this.dragStart = function (id, dom, e) {

    console.log("this.state.isNodeReorderEnabled: ", _this2.state.isNodeReorderEnabled);
    if (_this2.state.isNodeReorderEnabled == false) return;

    _this2.dragAndDropActive = true;

    _this2.dragging = {
      id: id,
      w: dom.offsetWidth,
      h: dom.offsetHeight,
      x: dom.offsetLeft,
      y: dom.offsetTop
    };

    _this2.treeBeforeStartDrag = _this2.copyTree(_this2.state.tree);

    _this2._startX = dom.offsetLeft;
    _this2._startY = dom.offsetTop;
    _this2._offsetX = e.clientX;
    _this2._offsetY = e.clientY;
    _this2._draggingStarted = true;

    e.target.addEventListener('drag', _this2.drag);
    e.target.addEventListener('dragend', _this2.dragEnd);
  };

  this.drag = function (e) {

    if (!_this2.isInside(e)) {
      _this2.dragCancel(e);
      return;
    }

    if (_this2._draggingStarted) {
      _this2.setState({
        dragging: _this2.dragging
      });
      _this2._draggingStarted = false;
    }

    var tree = _this2.state.tree;
    var dragging = _this2.state.dragging;
    var paddingLeft = _this2.props.paddingLeft;

    var newIndex = null;
    var index = tree.getIndex(dragging.id);
    var collapsed = index.node.collapsed;

    var _startX = _this2._startX;
    var _startY = _this2._startY;
    var _offsetX = _this2._offsetX;
    var _offsetY = _this2._offsetY;

    var pos = {
      x: _startX + e.clientX - _offsetX,
      y: _startY + e.clientY - _offsetY
    };
    dragging.x = pos.x;
    dragging.y = pos.y;

    var diffX = dragging.x - paddingLeft / 2 - (index.left - 2) * paddingLeft;
    var diffY = dragging.y - dragging.h / 2 - (index.top - 2) * dragging.h;

    if (diffX < 0) {
      // left
      if (index.parent && !index.next) {
        newIndex = tree.move(index.id, index.parent, 'after');
      }
    } else if (diffX > paddingLeft) {
      // right
      if (index.prev) {
        var prevNode = tree.getIndex(index.prev).node;
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
      var above = tree.getNodeByTop(index.top - 1);
      newIndex = tree.move(index.id, above.id, 'before');
    } else if (diffY > dragging.h) {
      // down
      if (index.next) {
        var below = tree.getIndex(index.next);
        if (below.children && below.children.length && !below.node.collapsed) {
          newIndex = tree.move(index.id, index.next, 'prepend');
        } else {
          newIndex = tree.move(index.id, index.next, 'after');
        }
      } else {
        var _below = tree.getNodeByTop(index.top + index.height);
        if (_below && _below.parent !== index.id) {
          if (_below.children && _below.children.length && !_below.node.collapsed) {
            newIndex = tree.move(index.id, _below.id, 'prepend');
          } else {
            newIndex = tree.move(index.id, _below.id, 'after');
          }
        }
      }
    }

    if (newIndex) {
      newIndex.node.collapsed = collapsed;
      dragging.id = newIndex.id;
    }

    _this2.setState({
      tree: tree,
      dragging: dragging
    });
  };

  this.dragEnd = function (e) {
    _this2.setState({
      dragging: {
        id: null,
        x: null,
        y: null,
        w: null,
        h: null
      }
    });

    e.target.removeEventListener('drag', _this2.drag);
    e.target.removeEventListener('dragend', _this2.dragEnd);
  };

  this.dragCancel = function (e) {
    e.target.removeEventListener('drag', _this2.drag);
    e.target.removeEventListener('dragend', _this2.dragEnd);

    if (_this2.treeBeforeStartDrag != null) {
      var newTree = _this2.treeBeforeStartDrag;
      _this2.treeBeforeStartDrag = null;

      _this2.setState({
        tree: newTree,
        dragging: {
          id: null,
          x: null,
          y: null,
          w: null,
          h: null
        }
      });

      _this2.change(newTree);
    }
  };

  this.change = function (tree) {
    _this2._updated = true;
    if (_this2.props.onChange) _this2.props.onChange(tree.obj);
  };

  this.toggleCollapse = function (nodeId) {
    var tree = _this2.state.tree;
    var index = tree.getIndex(nodeId);
    var node = index.node;
    node.collapsed = !node.collapsed;
    tree.updateNodesPosition();

    _this2.setState({
      tree: tree
    });

    _this2.change(tree);
  };
};

module.exports = UITree;
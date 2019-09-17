import * as React from 'react';
import * as styles from './tree.module.less';
import * as cls from 'classnames';
import { TreeNode, TreeViewAction, TreeViewActionTypes, ExpandableTreeNode, SelectableTreeNode, TreeNodeHighlightRange } from './';
import { TEMP_FILE_NAME } from './tree.view';

export type CommandActuator<T = any> = (commandId: string, params: T) => void;

export interface TreeNodeProps extends React.PropsWithChildren<any> {
  node: TreeNode;
  leftPadding?: number;
  onSelect?: any;
  onTwistieClick?: any;
  onContextMenu?: any;
  onDragStart?: any;
  onDragEnter?: any;
  onDragOver?: any;
  onDragLeave?: any;
  onDrag?: any;
  draggable?: boolean;
  isEdited?: boolean;
  actions?: TreeViewAction[];
  replace?: string;
  commandActuator?: CommandActuator;
}

const renderIcon = (node: TreeNode) => {
  return <div className={ cls(node.icon, styles.kt_file_icon) }></div>;
};
const renderNameWithRangeAndReplace = (name: string = 'UNKNOW', range?: TreeNodeHighlightRange, replace?: string) => {
  if (name === 'UNKNOW') {
    return 'UNKNOW';
  }
  if (range) {
    return <div>
      { name.slice(0, range.start) }
      <span className={ cls(styles.kt_search_match, replace && styles.replace) }>
        { name.slice(range.start, range.end) }
      </span>
      <span className={ replace && styles.kt_search_replace }>
        { replace }
      </span>
      { name.slice(range.end) }

    </div>;
  } else {
    return name;
  }
};

const renderDisplayName = (node: TreeNode, replace: string, updateHandler: any) => {
  const [value, setValue] = React.useState(node.uri ? node.uri.displayName === TEMP_FILE_NAME ? '' : node.uri.displayName : node.name);

  const changeHandler = (event) => {
    setValue(event.target.value);
  };

  const blurHandler = (event) => {
    updateHandler(node, value);
  };

  const keydownHandler = (event: React.KeyboardEvent) => {
    if (event.keyCode === 13) {
      event.stopPropagation();
      event.preventDefault();
      updateHandler(node, value);
    }
  };

  if (node.filestat && node.filestat.isTemporaryFile) {
    return <div
      className={ cls(styles.kt_treenode_segment, styles.kt_treenode_segment_grow) }
    >
      <div className={ styles.kt_input_wrapper }>
        <input
          type='text'
          className={ styles.kt_input_box }
          autoFocus={ true }
          onBlur = { blurHandler }
          value = { value }
          onChange = { changeHandler}
          onKeyDown = { keydownHandler }
          />
      </div>
    </div>;
  }
  if (node.description) {
    return <div
      className={ cls(styles.kt_treenode_segment, styles.kt_treenode_displayname) }
    >
      { node.name || 'UNKONW' }
    </div>;
  } else {
    return <div
      className={ cls(styles.kt_treenode_segment, styles.kt_treenode_segment_grow) }
    >
      { renderNameWithRangeAndReplace(node.name, node.highLightRange, replace) }
    </div>;
  }

};

const renderBadge = (node: TreeNode) => {
  if (typeof node.badge === 'number') {
    return <div className={styles.kt_treenode_count} style={node.badgeStyle}>
      {node.badge > 99 ? '99+' : node.badge}
    </div>;
  } else if (typeof node.badge === 'string') {
    return <div className={styles.kt_treenode_status} style={node.badgeStyle}>
      {node.badge}
    </div>;
  }
};

const renderStatusTail = (node: TreeNode) => {
  return <div className={ cls(styles.kt_treenode_segment, styles.kt_treenode_tail) }>
    {
      renderBadge(node)
    }
  </div>;
};

const renderDescription = (node: any) => {
  return <div className={ cls(styles.kt_treenode_segment_grow, styles.kt_treenode_description) }>{ node.description || '' }</div>;
};

const renderFolderToggle = <T extends ExpandableTreeNode>(node: T, clickHandler: any) => {
  return <div
    onClick={ clickHandler }
    className={ cls(
      styles.kt_treenode_segment,
      styles.kt_expansion_toggle,
      {[`${styles.kt_mod_collapsed}`]: !node.expanded},
    )}
  >
  </div>;
};

export const TreeContainerNode = (
  {
    node,
    leftPadding,
    onSelect,
    onTwistieClick,
    onContextMenu,
    onDragStart,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDragEnd,
    onDrag,
    onDrop,
    onChange,
    draggable,
    foldable,
    isEdited,
    actions = [],
    commandActuator,
    replace = '',
    itemLineHeight,
  }: TreeNodeProps,
) => {

  const selectHandler = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (ExpandableTreeNode.is(node) && !foldable) {
      return;
    }
    if (isEdited) {
      return ;
    }
    onSelect(node, event);
  };

  const twistieClickHandler = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (isEdited) {
      return ;
    }
    onTwistieClick(node, event);
  };

  const contextMenuHandler = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (isEdited) {
      return ;
    }
    onContextMenu(node, event);
  };

  const dragStartHandler = (event) => {
    event.stopPropagation();
    if (isEdited) {
      event.preventDefault();
      return ;
    }
    onDragStart(node, event);
  };

  const dragEnterHandler = (event) => {
    if (isEdited) {
      event.stopPropagation();
      event.preventDefault();
      return ;
    }
    onDragEnter(node, event);
  };

  const dragOverHandler = (event) => {
    if (isEdited) {
      event.stopPropagation();
      event.preventDefault();
      return ;
    }
    onDragOver(node, event);
  };

  const dragLeaveHandler = (event) => {
    if (isEdited) {
      event.stopPropagation();
      event.preventDefault();
      return ;
    }
    onDragLeave(node, event);
  };

  const dragEndHandler = (event) => {
    if (isEdited) {
      event.stopPropagation();
      event.preventDefault();
      return ;
    }
    onDragEnd(node, event);
  };

  const dragHandler = (event) => {
    if (isEdited) {
      event.stopPropagation();
      event.preventDefault();
      return ;
    }
    onDrag(node, event);
  };

  const dropHandler = (event) => {
    if (isEdited) {
      event.stopPropagation();
      event.preventDefault();
      return ;
    }
    onDrop(node, event);
  };

  const FileTreeNodeWrapperStyle = {
    position: 'absolute',
    width: '100%',
    height: itemLineHeight,
    left: '0',
    opacity: isEdited && !node.filestat.isTemporaryFile ? .3 : 1,
    top: `${(node.order || 0) * itemLineHeight}px`,
  } as React.CSSProperties;

  const TreeNodeStyle = {
    paddingLeft: `${10 + node.depth * (leftPadding || 0) }px`,
    color: node.color,
  } as React.CSSProperties;

  const renderTreeNodeActions = (node: TreeNode, actions: TreeViewAction[], commandActuator: CommandActuator) => {
    return actions.map((action: TreeViewAction) => {
      const clickHandler = (event: React.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        commandActuator(action.command, action.paramsKey ? node[action.paramsKey] : node.uri);
      };
      const icon = typeof action.icon === 'string' ? action.icon : action.icon.dark;
      return <i key={ action.title } className={ icon } title={ action.title } onClick={ clickHandler }></i>;
    });
  };

  const renderTreeNodeLeftActions = (node: TreeNode, actions: TreeViewAction[], commandActuator: any) => {
    if (actions.length === 0) {
      return;
    }
    return <div className={styles.left_actions}>
      { renderTreeNodeActions(node, actions, commandActuator) }
    </div>;

  };

  const renderTreeNodeRightActions = (node: TreeNode, actions: TreeViewAction[], commandActuator: any) => {
    if (actions.length === 0) {
      return;
    }
    return <div className={styles.right_actions}>
      { renderTreeNodeActions(node, actions, commandActuator) }
    </div>;

  };

  const renderTreeContainerActions = (node: TreeNode, actions: TreeViewAction[], commandActuator: any) => {
    return <div className={styles.container_actions}>
      { renderTreeNodeActions(node, actions, commandActuator) }
    </div>;

  };

  const renderActionBar = (node: TreeNode, actions: TreeViewAction[], commandActuator: any) => {
    const treeNodeLeftActions: TreeViewAction[] = [];
    const treeNodeRightActions: TreeViewAction[] = [];
    const treeContainerActions: TreeViewAction[] = [];
    for (const action of actions) {
      switch (action.location) {
        case TreeViewActionTypes.TreeNode_Left:
          treeNodeLeftActions.push(action);
          break;
        case TreeViewActionTypes.TreeNode_Right:
          treeNodeRightActions.push(action);
          break;
        case TreeViewActionTypes.TreeContainer:
          treeContainerActions.push(action);
          break;
        default:
          break;
      }
    }
    if (ExpandableTreeNode.is(node)) {
      if (treeContainerActions.length > 0) {
        return <div className={cls(styles.kt_treenode_action_bar)}>
          { renderTreeContainerActions(node, treeContainerActions, commandActuator) }
        </div>;
      }
    } else if (treeNodeLeftActions.length !== 0 || treeNodeRightActions.length !== 0) {
      return <div className={cls(styles.kt_treenode_action_bar)}>
        { renderTreeNodeLeftActions(node, treeNodeLeftActions, commandActuator) }
        { renderTreeNodeRightActions(node, treeNodeRightActions, commandActuator) }
      </div>;
    }
    return null;
  };

  return (
    <div
      key={ node.id }
      style={ FileTreeNodeWrapperStyle }
      title = { node.tooltip }
      draggable={ draggable }
      onDragStart={ dragStartHandler }
      onDragEnter={ dragEnterHandler }
      onDragOver={ dragOverHandler }
      onDragLeave={ dragLeaveHandler }
      onDragEnd={ dragEndHandler }
      onDrag={ dragHandler }
      onDrop={ dropHandler }
      onContextMenu={ contextMenuHandler }
      onClick={ selectHandler }
      >
      <div
        className={ cls(styles.kt_treenode, SelectableTreeNode.hasFocus(node) ? styles.kt_mod_focused : SelectableTreeNode.isSelected(node) ? styles.kt_mod_selected : '') }
        style={ TreeNodeStyle }
      >
        <div className={ cls(styles.kt_treenode_content, node.badge ? styles.kt_treenode_has_badge : '') }>
          { renderActionBar(node, node.actions || actions, commandActuator) }
          { ExpandableTreeNode.is(node) && foldable && renderFolderToggle(node, twistieClickHandler) }
          { renderIcon(node) }
          { renderDisplayName(node, replace, onChange) }
          { renderDescription(node) }
          { renderStatusTail(node) }
        </div>
      </div>
    </div>
  );
};

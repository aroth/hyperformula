export class Leaf<T> {
  constructor(
    public keys: number[],
    public values: T[],
    public shift: number,
  ) {
  }
}

export class Internal<T> {
  constructor(
    public keys: number[],
    public children: PNode<T>[],
    public shift: number,
  ) {
  }
}

type PNode<T> = Leaf<T> | Internal<T>

export class PlusTree<T> {
  public static empty(span: number) {
    return new PlusTree(span, new Leaf([], [], 0))
  }
  private readonly minSize: number
  private readonly maxSize: number

  constructor(
    private readonly span: number,
    public _root: PNode<T>,
  ) {
    this.minSize = this.span - 1
    this.maxSize = 2 * this.span - 1
  }

  public getKey(key: number): T | null {
    return this.getKeyRecursive(this._root, key)
  }

  private getKeyRecursive(node: PNode<T>, key: number): T | null {
    const sKey = key - node.shift
    if (node instanceof Leaf) {
      const index = node.keys.indexOf(sKey)
      if (index === -1) {
        return null
      } else {
        return node.values[index]
      }
    } else {
      const indexOfBiggerKey = this.findChildIndex(node, sKey)
      return this.getKeyRecursive(node.children[indexOfBiggerKey], sKey)
    }
  }

  public addKeyWithShift(key: number, value: T) {
    this.addKeyWithShiftRecursive(this._root, key, value)
    if (this._root.keys.length > this.maxSize) {
      const newRoot = new Internal([], [this._root], 0)
      this.splitNode(newRoot, 0)
      this._root = newRoot
    }
  }

  private addKeyWithShiftRecursive(node: PNode<T>, key: number, value: T) {
    const sKey = key - node.shift
    const indexWhereToAddIt = this.findChildIndex(node, sKey)
    if (node instanceof Leaf) {
      for (let i = indexWhereToAddIt; i < node.keys.length; i++) {
        node.keys[i]++
      }
      node.keys.splice(indexWhereToAddIt, 0, sKey)
      node.values.splice(indexWhereToAddIt, 0, value)
    } else {
      const childNode = node.children[indexWhereToAddIt]
      this.addKeyWithShiftRecursive(childNode, sKey, value)
      for (let i = indexWhereToAddIt; i < node.keys.length; i++) {
        node.keys[i]++
        node.children[i+1].shift++
      }
      if (childNode.keys.length > this.maxSize) {
        this.splitNode(node, indexWhereToAddIt)
      }
    }
  }

  private splitNode(parentNode: Internal<T>, index: number) {
    const currentNode = parentNode.children[index]
    if (currentNode instanceof Leaf) {
      const keysForNewNode = currentNode.keys.splice(this.span, this.span)
      const valuesForNewNode = currentNode.values.splice(this.span, this.span)
      const newNode = new Leaf(keysForNewNode, valuesForNewNode, currentNode.shift)
      parentNode.keys.splice(index, 0, this.adjustKeyWhenMovingFromChildToParent(currentNode.keys[currentNode.keys.length - 1], currentNode))
      parentNode.children.splice(index + 1, 0, newNode)
    } else {
      const keysForNewNode = currentNode.keys.splice(this.span + 1, this.span - 1)
      const childrenForNewNode = currentNode.children.splice(this.span + 1, this.span)
      const newNode = new Internal(keysForNewNode, childrenForNewNode, currentNode.shift)
      parentNode.keys.splice(index, 0, this.adjustKeyWhenMovingFromChildToParent(currentNode.keys.pop()!, currentNode))
      parentNode.children.splice(index + 1, 0, newNode)
    }
  }

  public deleteKeyWithShift(key: number) {
    this.deleteKeyWithShiftRecursive(this._root, key)
  }

  private deleteKeyWithShiftRecursive(node: PNode<T>, key: number) {
    const sKey = key - node.shift
    if (node instanceof Leaf) {
      const foundIndex = node.keys.findIndex(k => k >= sKey)
      if (foundIndex !== -1) {
        if (node.keys[foundIndex] === sKey) {
          node.keys.splice(foundIndex, 1)
          node.values.splice(foundIndex, 1)
        }
        for (let i = foundIndex; i < node.keys.length; i++) {
          node.keys[i]--;
        }
      }
    } else {
      const foundIndex = this.findChildIndex(node, sKey)
      const childNode = node.children[foundIndex]
      this.deleteKeyWithShiftRecursive(childNode, sKey)
      for (let i = foundIndex; i < node.keys.length; i++) {
        node.keys[i]--
        node.children[i+1].shift--
      }
      if (childNode.keys.length < this.minSize) {
        const rightSibling = node.children[foundIndex + 1]
        const leftSibling = node.children[foundIndex - 1]
        if (rightSibling && rightSibling.keys.length === this.minSize) {
          this.mergeNode(node, foundIndex)
        } else if (leftSibling && leftSibling.keys.length === this.minSize) {
          this.mergeNode(node, foundIndex - 1)
        } else if (rightSibling) {
          this.pullOneElementFromRight(node, foundIndex)
        } else if (leftSibling) {
          this.pullOneElementFromLeft(node, foundIndex)
        }
      }
    }
  }

  private findChildIndex(node: PNode<T>, sKey: number): number {
    const foundIndex = node.keys.findIndex(k => k >= sKey)
    if (foundIndex === -1) {
      return node.keys.length
    } else {
      return foundIndex
    }
  }

  private mergeNode(parentNode: Internal<T>, index: number) {
    const childNode = parentNode.children[index]
    const rightSibling = parentNode.children[index + 1]
    if (childNode instanceof Leaf && rightSibling instanceof Leaf) {
      childNode.keys = childNode.keys.concat(rightSibling.keys.map(k => this.adjustKeyWhenMovingFromSiblingToSibling(k, rightSibling, childNode)))
      childNode.values = childNode.values.concat(rightSibling.values)
      parentNode.keys.splice(index, 1)
      parentNode.children.splice(index + 1, 1)
    } else if (childNode instanceof Internal && rightSibling instanceof Internal ) {
      childNode.keys.push(this.getRightmostKey(childNode.children[childNode.children.length - 1]))
      childNode.keys = childNode.keys.concat(rightSibling.keys.map(k => this.adjustKeyWhenMovingFromSiblingToSibling(k, rightSibling, childNode)))
      for (const childOfRightSibling of rightSibling.children) {
        childOfRightSibling.shift = this.adjustKeyWhenMovingFromSiblingToSibling(childOfRightSibling.shift, rightSibling, childNode)
      }
      childNode.children = childNode.children.concat(rightSibling.children)
      parentNode.keys.splice(index, 1)
      parentNode.children.splice(index + 1, 1)
    } else {
      throw Error("Cant happen")
    }
  }

  private pullOneElementFromRight(parentNode: Internal<T>, index: number) {
    const childNode = parentNode.children[index]
    const rightSibling = parentNode.children[index + 1]
    if (childNode instanceof Leaf && rightSibling instanceof Leaf) {
      childNode.keys.push(this.adjustKeyWhenMovingFromSiblingToSibling(rightSibling.keys.shift()!, rightSibling, childNode))
      childNode.values.push(rightSibling.values.shift()!)
      parentNode.keys[index] = this.adjustKeyWhenMovingFromChildToParent(childNode.keys[childNode.keys.length - 1], childNode)
    } else if (childNode instanceof Internal && rightSibling instanceof Internal) {
      childNode.keys.push(this.getRightmostKey(childNode.children[childNode.children.length - 1]))
      const movedChild = rightSibling.children.shift()!
      movedChild.shift = this.adjustKeyWhenMovingFromSiblingToSibling(movedChild.shift, rightSibling, childNode)
      childNode.children.push(movedChild)
      parentNode.keys[index] = this.adjustKeyWhenMovingFromChildToParent(rightSibling.keys.shift()!, rightSibling)
    } else {
      throw Error("Cant happen")
    }
  }

  private getRightmostKey(node: PNode<T>): number {
    if (node instanceof Leaf) {
      return node.keys[node.keys.length - 1] + node.shift
    } else {
      return this.getRightmostKey(node.children[node.children.length - 1]) + node.shift
    }
  }

  private pullOneElementFromLeft(parentNode: Internal<T>, index: number) {
    const childNode = parentNode.children[index]
    const leftSibling = parentNode.children[index - 1]
    if (childNode instanceof Leaf && leftSibling instanceof Leaf) {
      childNode.keys.unshift(this.adjustKeyWhenMovingFromSiblingToSibling(leftSibling.keys.pop()!, leftSibling, childNode))
      childNode.values.unshift(leftSibling.values.pop()!)
      parentNode.keys[index - 1] = this.adjustKeyWhenMovingFromChildToParent(leftSibling.keys[leftSibling.keys.length - 1], leftSibling)
    } else if (childNode instanceof Internal && leftSibling instanceof Internal) {
      childNode.keys.unshift(this.adjustKeyWhenMovingFromSiblingToSibling(this.getRightmostKey(leftSibling), leftSibling, childNode))
      const movedChild = leftSibling.children.pop()!
      movedChild.shift = this.adjustKeyWhenMovingFromSiblingToSibling(movedChild.shift, leftSibling, childNode)
      childNode.children.unshift(movedChild)
      parentNode.keys[index - 1] = this.adjustKeyWhenMovingFromChildToParent(leftSibling.keys.pop()!, leftSibling)
    } else {
      throw Error("Cant happen")
    }
  }

  private adjustKeyWhenMovingFromSiblingToSibling(key: number, fromNode: PNode<T>, toNode: PNode<T>): number {
    return key + fromNode.shift - toNode.shift;
  }

  private adjustKeyWhenMovingFromChildToParent(key: number, childNode: PNode<T>): number {
    return key + childNode.shift;
  }
}

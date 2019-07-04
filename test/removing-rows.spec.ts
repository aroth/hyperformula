import {HandsOnEngine} from "../src";
import {SimpleCellAddress, simpleCellAddress} from "../src/Cell";
import {CellAddress} from "../src/parser/CellAddress";
import './testConfig.ts'
import {FormulaCellVertex} from "../src/DependencyGraph";
import {CellReferenceAst} from "../src/parser";

const extractReference = (engine: HandsOnEngine, address: SimpleCellAddress): CellAddress => {
  return ((engine.addressMapping!.fetchCell(address) as FormulaCellVertex).getFormula() as CellReferenceAst).reference
}

describe('Removing rows', () => {
  it('should not affect absolute dependencies to other sheet', () => {
    const engine = HandsOnEngine.buildFromSheets({
      Sheet1: [
          ['1'], // rows to delete
          ['2'], //
          ['=$Sheet2.A$1']
      ],
      Sheet2: [
          ['3'],
          ['4']
      ]
    })

    expect(extractReference(engine, simpleCellAddress(0, 0, 2))).toEqual(CellAddress.absoluteRow(1, 0, 0))
    engine.removeRows(0, 0, 1)
    expect(extractReference(engine, simpleCellAddress(0, 0, 0))).toEqual(CellAddress.absoluteRow(1, 0, 0))
  })

  it('same sheet, case Aa, absolute row', () => {
    const engine = HandsOnEngine.buildFromArray([
      [''],
      ['1'],
      [''], // row to delete
      ['=A$2'],
    ])

    engine.removeRows(0, 2)

    expect(extractReference(engine, simpleCellAddress(0, 0, 2))).toEqual(CellAddress.absoluteRow(0, 0, 1))
  })

  it('same sheet, case Ab', () => {
    const engine = HandsOnEngine.buildFromArray([
      ['=A$3'],
      [''], // row to delete
      ['42'],
    ])

    engine.removeRows(0, 1)

    expect(extractReference(engine, simpleCellAddress(0, 0, 0))).toEqual(CellAddress.absoluteRow(0, 0, 1))
  })
})
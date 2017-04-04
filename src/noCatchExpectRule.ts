
/*
    This file was compiled in another project. DO NOT EDIT.
    Copyright (c) 2017 Peter Safranek
    Protected under the MIT license (see LICENSE.md).
    Parts copied from the TSLint project: https://github.com/palantir/tslint/blob/7c841c0/src/rules/banRule.ts,
    which is protected under the Apache License, Version 2: http://www.apache.org/licenses/LICENSE-2.0

    This rule makes sure that Jasmine's `expect()` function isn't called within a `catch` clause, which can cause
    tests to incorrectly succeed.
 */

import * as ts from 'typescript';
import * as TSlint from 'tslint';

const EXPECT = 'expect';

export class Rule extends TSlint.Rules.AbstractRule {

    public static FAILURE_MESSAGE: string = 'Cannot call expect() within a catch block.';

    public apply(sourceFile: ts.SourceFile): Array<TSlint.RuleFailure> {
        return this.applyWithWalker(new NoCatchExpectWalker(sourceFile, this.getOptions()));
    }
}

class NoCatchExpectWalker extends TSlint.RuleWalker {

    public visitCallExpression(node: ts.CallExpression): void {
        if (this._checkForExpectCall(node.expression)) {
            if (this._findCatchParent(node)) {
                this.addFailureAtNode(node.expression, Rule.FAILURE_MESSAGE);
            }
        }
        super.visitCallExpression(node);
    }

    private _checkForExpectCall(expression: ts.LeftHandSideExpression): boolean {
        if (expression.kind === ts.SyntaxKind.Identifier) {
            return (<ts.Identifier> expression).text === EXPECT;
        }
        return false;
    }

    private _findCatchParent(node: ts.Expression): boolean {
        if (node) {
            if (node.kind === ts.SyntaxKind.CatchClause) {
                return true;
            } else {
                return this._findCatchParent(<ts.Expression> node.parent);
            }
        }
        return false;
    }
}

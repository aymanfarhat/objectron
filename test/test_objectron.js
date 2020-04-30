const match = require('../objectron');
const assert = require('chai').assert;
const suite = require('mocha').suite;
const test = require('mocha').test;

suite('Objectron Core Tests', () => {
    test('Match with primitive types', () => {
        const payload = {
            'type': 'message',
            'text': 'text',
            'int': 1,
            'bool': true,
            'float': 1.1,
        }

        const result = match(payload, {
            'type': 'message',
            'text': 'text',
            'int': 1,
            'bool': true,
            'float': 1.1
        });

        const expected = {
            match: true,
            total: 5,
            matches: {
                'type': 'message',
                'text': 'text',
                'int': 1,
                'bool': true,
                'float': 1.1,
            },
            groups: {}
        };

        assert.isTrue(result.match);
        assert.deepEqual(result, expected);
    });

    test('Match depth 1 regular expressions', () => {
        const payload = {
            'type': 'message',
            'text': 'invite (Smith) (john@example.com) (CompanyX) (Engineer)',
        }

        const result = match(payload, {
            'type': 'message',
            'text': /invite \((?<name>\S+)\) \((?<email>\S+)\) \((?<company>\S+)\) \((?<role>\S+)\)/,
        });

        const expected = {
            match: true,
            total: 2,
            matches: {
                'type': 'message',
                'text': 'invite (Smith) (john@example.com) (CompanyX) (Engineer)',
            },
            groups: {
                name: 'Smith',
                email: 'john@example.com',
                company: 'CompanyX',
                role: 'Engineer'
            }
        };

        assert.isTrue(result.match);
        assert.deepEqual(result, expected);
    });

    test('Match nested object and depth 1 regular expression', () => {
        const payload = {
            'type': 'message',
            'text': 'invite (Smith) (john@example.com) (CompanyX) (Engineer)',
            'first_block': {
                'number': 1,
                'bool': true,
                'second_block': {
                    'number': 1,
                    'bool': true,
                    'string': 'foo bar'
                }
            }
        }

        const result = match(payload, {
            'type': 'message',
            'text': /invite \((?<name>\S+)\) \((?<email>\S+)\) \((?<company>\S+)\) \((?<role>\S+)\)/,
            'first_block': {
                'number': 1,
                'bool': true,
                'second_block': {
                    'number': 1,
                    'bool': true,
                    'string': /foo (?<who>.*)/
                }
            }
        });

        const expected = {
            match: true,
            total: 7,
            matches: {
                type: 'message',
                text: 'invite (Smith) (john@example.com) (CompanyX) (Engineer)',
                first_block: {
                    'number': 1,
                    'bool': true,
                    'second_block': {
                        'number': 1,
                        'bool': true,
                        'string': 'foo bar'
                    }
                }
            },
            groups: {
                name: 'Smith',
                email: 'john@example.com',
                company: 'CompanyX',
                role: 'Engineer',
                who: 'bar'
            }
        };

        assert.isTrue(result.match);
        assert.deepEqual(result, expected);
    });

    test('Match nested array', () => {
        const payload = {
            'type': 'message',
            'items': [0, 1, 2, 3]
        }    
        
        const result = match(payload, {
            'type': 'message',
            'items': [3, 2, 1, 0]
        })

        const expected = {
            match: true,
            total: 5,
            matches: {
                'type': 'message',
                'items': [3, 2, 1, 0]
            },
            groups: {}
        };

        assert.isTrue(result.match);
        assert.deepEqual(result, expected);
    });

    test('Match multi-type array', () => {
        const payload = {
            'type': 'message',
            'items': [true, 'foo', 2, 3]
        };

        const result = match(payload, {
            'type': 'message',
            'items': [true, 'foo', 2, 3]
        });

        const expected = {
            match: true,
            total: 5,
            matches: {
                'type': 'message',
                'items': [true, 'foo', 2, 3]
            },
            groups: {}
        };

        assert.isTrue(result.match);
        assert.deepEqual(result, expected);
    });

    test('Match depth 2 regular expression', () => {
        const payload = {
            'type': 'message',
            'items': ['ping john', 'hi smith', 'lorem ipsum']
        }

        const result = match(payload, {
            'type': 'message',
            'items': [/ping (?<someone>\S+)/, /hi (?<another>\S+)/, /lorem ipsum/ ]
        })

        const expected = {
            match: true,
            total: 4,
            matches: {
                'type': 'message',
                'items': ['ping john', 'hi smith', 'lorem ipsum']
            },    
            groups: {
                someone: 'john',
                another: 'smith'
            }
        };

        assert.isTrue(result.match);
        assert.deepEqual(result, expected);
    });

    test('Match depth 1 regular expression and depth 2 nested objects and arrays', () => {
        const payload = {
            'type': 'message',
            'text': 'invite (Smith) (john@example.com) (CompanyX) (Engineer)',
            'blocks': [
                {
                    'number': 1,
                    'bool': true,
                    'items': ['ping john', 'hi smith', 'lorem ipsum']
                },
                {
                    'number': 1,
                    'bool': true,
                    'string': 'ping john'
                }
            ]
        }

        const result = match(payload, {
            'type': 'message',
            'text': /invite \((?<name>\S+)\) \((?<email>\S+)\) \((?<company>\S+)\) \((?<role>\S+)\)/,
            'blocks': [
                {
                    'number': 1,
                    'bool': true,
                    'items': [/ping (?<someone>\S+)/, /hi (?<another>\S+)/, /lorem ipsum/ ]
                },{
                    'number': 1,
                    'bool': true,
                    'string': /ping (?<who>.*)/
                }    
            ]    
        })

        const expected = {
            match: true,
            total: 10,
            matches: {
                'type': 'message',
                'text': 'invite (Smith) (john@example.com) (CompanyX) (Engineer)',
                'blocks': [
                    {
                        'number': 1,
                        'bool': true,
                        'items': ['ping john', 'hi smith', 'lorem ipsum']
                    },{
                        'number': 1,
                        'bool': true,
                        'string': 'ping john'
                    }
                ]
            },
            groups: {
                name: 'Smith',
                email: 'john@example.com',
                company: 'CompanyX',
                role: 'Engineer',
                someone: 'john',
                another: 'smith',
                who: 'john'
            }
        };

        assert.isTrue(result.match);
        assert.deepEqual(result, expected);
    });
});
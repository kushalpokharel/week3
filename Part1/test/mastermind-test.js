//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected
const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;
const buildPoseidon = require("circomlibjs").buildPoseidon;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);
const assert = chai.assert;

describe("test for bagels", function(){
    let cir,poseidon,F;
    beforeEach(async()=>{
        poseidon = await buildPoseidon();
        F = poseidon.F;
        console.log(__dirname);
        cir = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        await cir.loadConstraints();
    });

    it("for the valid input guess", async()=>{

        const guess = [5,7,3];
        const solution = [5,3,2];
        const fermi = 1;
        const pico = 1;

        const salt = "999";
        const pubHash = poseidon([salt,solution[0],solution[1],solution[2]]);
        const pubSolnHash = F.toString(pubHash);
        const INPUT = {
            "pubGuessA": guess[0],
            "pubGuessB": guess[1],
            "pubGuessC": guess[2],
            "pubNumHit": fermi,
            "pubNumBlow": pico,
            "pubSolnHash": pubSolnHash,
            "privSolnA": solution[0],
            "privSolnB": solution[1],
            "privSolnC": solution[2],
            "privSalt": salt
        }
        const w = await cir.calculateWitness(INPUT,true);
        // console.log(w);
        assert(Fr.eq(Fr.e(w[0]), Fr.e(1)));
        assert(Fr.eq(Fr.e(w[1]), Fr.e(pubSolnHash)));
    });

    it("for the valid correct guess", async()=>{

        const guess = [5,3,2];
        const solution = [5,3,2];
        const fermi = 3;
        const pico = 0;

        const salt = "999";
        const pubHash = poseidon([salt,solution[0],solution[1],solution[2]]);
        const pubSolnHash = F.toString(pubHash);
        const INPUT = {
            "pubGuessA": guess[0],
            "pubGuessB": guess[1],
            "pubGuessC": guess[2],
            "pubNumHit": fermi,
            "pubNumBlow": pico,
            "pubSolnHash": pubSolnHash,
            "privSolnA": solution[0],
            "privSolnB": solution[1],
            "privSolnC": solution[2],
            "privSalt": salt
        }
        const w = await cir.calculateWitness(INPUT,true);
        // console.log(w);
        assert(Fr.eq(Fr.e(w[0]), Fr.e(1)));
        assert(Fr.eq(Fr.e(w[1]), Fr.e(pubSolnHash)));
    });

    it("for the invalid non unique input guess, the execution fails", async()=>{
        //non unique guess, similarly for any digit greater than 9, the execution would fail
        const guess = [5,7,7];
        const solution = [5,3,2];
        const fermi = 1;
        const pico = 0;

        const salt = "999";
        const pubHash = poseidon([salt,solution[0],solution[1],solution[2]]);
        const pubSolnHash = F.toString(pubHash);
        const INPUT = {
            "pubGuessA": guess[0],
            "pubGuessB": guess[1],
            "pubGuessC": guess[2],
            "pubNumHit": fermi,
            "pubNumBlow": pico,
            "pubSolnHash": pubSolnHash,
            "privSolnA": solution[0],
            "privSolnB": solution[1],
            "privSolnC": solution[2],
            "privSalt": salt
        }
        const w = await cir.calculateWitness(INPUT,true);
        console.log(w);
        assert(Fr.eq(Fr.e(w[0]), Fr.e(1)));
        assert(Fr.eq(Fr.e(w[1]), Fr.e(pubSolnHash)));
    });
})
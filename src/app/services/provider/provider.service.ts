import { Injectable } from '@angular/core';
import { Observable, from, forkJoin } from 'rxjs';
import { take, mergeMap, switchMap } from 'rxjs/operators';

import Web3 from 'web3';

import { TransactionParameter, ResumeContract, StrLibContract, ResumeInitialOptions, ProfileModel } from './../../types';

declare let window: any;
declare let require: any;

const TruffleContract = require('@truffle/contract');

@Injectable({
  providedIn: 'root'
})
export class ProviderService {
    private web3: any = null;
    private accountList: Array<string> = [];

    constructor() {
        this.web3 = typeof window.web3 !== 'undefined'
        ? new Web3(window.web3.currentProvider)
        : new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
        window.web3 = this.web3;
        this.enableConnect().pipe(take(1)).subscribe(
            res => { this.accountList = res; },
            err => { console.error(err); }
        );
    }

    public set defaultAccount(account: string) {
      this.web3.eth.defaultAccount = account;
    }

    public get defaultAccount(): string {
        return this.web3.eth.defaultAccount;
    }

    public get accounts(): Array<string> {
        return this.accountList;
    }

    public enableConnect(): Observable<any> {
        return from(this.web3.currentProvider.enable());
    }

    public getAccount(): Observable<any> {
        return from(this.web3.eth.getAccounts());
    }

    public getBlock(index: number): Observable<any> {
        return from(this.web3.eth.getBlock(index));
    }

    public getCurrentBlockNumber(): Observable<any> {
        return from(this.web3.eth.getBlockNumber());
    }

    public getTransaction(txHash: string): Observable<any> {
        return from(this.web3.eth.getTransaction(txHash));
    }

    public getReceipt(txHash: string): Observable<any> {
        return from(this.web3.eth.getTransactionReceipt(txHash));
    }

    public sendTransaction(params: TransactionParameter): Observable<any> {
        return from(this.web3.eth.sendTransaction(params));
    }

    public deployResume(info: ResumeInitialOptions,address: string): Observable<any> {
        console.log('address',address);
        const strLib = TruffleContract(StrLibContract);
        const resume = TruffleContract(ResumeContract);
        strLib.setProvider(this.web3.currentProvider);
        resume.setProvider(this.web3.currentProvider);
        resume.setNetwork(this.web3.currentProvider.networkVersion);
        return from(strLib.new({ from: address })).pipe(
            mergeMap((instance: any) => {
                resume.link('StrLib', instance.address);
                return resume.new(info.name, address, info.age, info.gender, { from: address });
            }),
            take(1),
            mergeMap((instance: any) => {
                resume.link('StrLib', instance.address);
                return resume.new(info.name, address, info.age, info.gender, { from: address });
            }),
            take(1)
        );
    }
    
    public async getNeedValidResume(): Promise<any> { 
        const latest = await this.web3.eth.getBlockNumber();
        var result = [];
        var profileResult = [];
        for (let index = 0; index < latest; index++) {
            const block = await this.web3.eth.getBlock(index);
            if(block.transactions.length > 0){
                for (let j = 0; j < block.transactions.length; j++) {
                    const transaction = await this.web3.eth.getTransaction(block.transactions[j])
            
                    const receipt = await this.web3.eth.getTransactionReceipt(transaction.hash)
                    console.log('receipt',receipt);
                    
                    try{
                        const contract = await new this.web3.eth.Contract(ResumeContract.abi, receipt.contractAddress);
                        console.log('contract',contract);
                        const profile = await contract.methods.profile().call();
                        console.log('profile',profile);

                        if(profile.isValid == false && profile.contact != ""){
                            result.push(new this.web3.eth.Contract(ResumeContract.abi, receipt.contractAddress))
                            profileResult.push(profile)
                            console.log('profile',profile);
                        }
                    }catch  (e) {
                    }
                }
                
            }
        }
        console.log('profile array',result);
        return {'contract':result,'profiles':profileResult};
    }

    public async getNeedValidSchoolResume(): Promise<any> { 
        const latest = await this.web3.eth.getBlockNumber();
        var result = [];
        for (let index = 0; index < latest; index++) {
            const block = await this.web3.eth.getBlock(index);
            if(block.transactions.length > 0){
                for (let j = 0; j < block.transactions.length; j++) {
                    const transaction = await this.web3.eth.getTransaction(block.transactions[j])
            
                    const receipt = await this.web3.eth.getTransactionReceipt(transaction.hash)
                    
                    try{
                        const contract = await new this.web3.eth.Contract(ResumeContract.abi, receipt.contractAddress);
                        const resume = new ProfileModel(contract);
                        console.log(resume);
                        if(resume){
                            const countReq = [];
                            await resume.setBasic();
                            countReq.push(this.executeMethod(contract.methods.getEducationCount().call()));
                
                            forkJoin(countReq).pipe(
                                switchMap(res => {
                                    resume.setCounts(res);
                                    return resume.setEducations();
                                }),
                                take(1)
                            ).subscribe(() => {
                                for (let index = 0; index < resume.educations.items.length; index++) {
                                    const education = resume.educations.items[index];
                                    if(education.isValid == false){
                                        result.push({'contract':new this.web3.eth.Contract(ResumeContract.abi, receipt.contractAddress),
                                        'profile':resume,'education': education});
                                    }
                                }
                                
                            });
                        }   
                    }catch  (e) {
                    }
                }
                
            }
        }
        console.log('array',result);
        return result;
    }

    public async getNeedValidCompanyResume(): Promise<any> { 
        const latest = await this.web3.eth.getBlockNumber();
        var result = [];
        for (let index = 0; index < latest; index++) {
            const block = await this.web3.eth.getBlock(index);
            if(block.transactions.length > 0){
                for (let j = 0; j < block.transactions.length; j++) {
                    const transaction = await this.web3.eth.getTransaction(block.transactions[j])
            
                    const receipt = await this.web3.eth.getTransactionReceipt(transaction.hash)
                    
                    try{
                        const contract = await new this.web3.eth.Contract(ResumeContract.abi, receipt.contractAddress);
                        const resume = new ProfileModel(contract);
                        console.log(resume);
                        if(resume){
                            await resume.setBasic();

                            const countReq = [];
                            countReq.push(this.executeMethod(contract.methods.getEducationCount().call()));
                            countReq.push(this.executeMethod(contract.methods.getExperienceCount().call()));
                            countReq.push(this.executeMethod(contract.methods.getSkillCount().call()));
                    
                            forkJoin(countReq).pipe(
                                switchMap(res => {
                                    console.log('setEducations');
                                    resume.setCounts(res);
                                    return resume.setEducations();
                                }),
                                switchMap(() => {
                                    console.log('setExperiences');
                                    return resume.setExperiences();
                                }),
                                switchMap(() => {
                                    console.log('setSkills');
                                    return resume.setSkills();
                                }),
                                take(1)
                            ).subscribe(() => {
                                for (let index = 0; index < resume.experiences.items.length; index++) {
                                    const job = resume.experiences.items[index];
                                    if(job.isValid == false){
                                        result.push({'contract':new this.web3.eth.Contract(ResumeContract.abi, receipt.contractAddress),
                                        'profile':resume,'job': job});
                                    }
                                }
                            });

                        }   
                    }catch  (e) {
                    }
                }
                
            }
        }
        console.log('getNeedValidCompanyResume',result);
        return result;
    }

    public async getResume(address: string): Promise<any> { 
        const latest = await this.web3.eth.getBlockNumber()
        console.log('latest',latest);
        for (let index = 0; index < latest; index++) {
            const block = await this.web3.eth.getBlock(index);
            // if(block.transactions.length > 0){
                for (let j = 0; j < block.transactions.length; j++) {
                    const transaction = await this.web3.eth.getTransaction(block.transactions[j])
                
                    const receipt = await this.web3.eth.getTransactionReceipt(transaction.hash)
                    console.log('receipt',receipt);
                    
                    try{
                        const contract = await new this.web3.eth.Contract(ResumeContract.abi, receipt.contractAddress);
                        console.log('contract',contract);
                        const profile = await contract.methods.profile().call();
                        console.log('profile',profile);
                        console.log('profile.account',profile.account);
                        if(profile.account == address){
                            console.log('profile',profile);
                            return new this.web3.eth.Contract(ResumeContract.abi, receipt.contractAddress);
                        }
                    }catch  (e) {
                    }
                }
                

            // }
        }
        // return new this.web3.eth.Contract(ResumeContract.abi, address);
        console.log('profile empty');

        return null;
    }

    public executeMethod(method: any): Observable<any> {
        return from(method);
    }

}

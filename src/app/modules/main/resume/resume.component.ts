import { Component, OnInit } from '@angular/core';
import { faPhone,faEnvelopeSquare,faGlobe,faUser,faBriefcase,faArchive,faRocket } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.scss']
})

export class ResumeComponent implements OnInit {
  faPhone = faPhone;
  faUser = faUser;
  faEnvelopeSquare = faEnvelopeSquare;
  faGlobe = faGlobe;
  faBriefcase = faBriefcase;
  faArchive = faArchive;
  faRocket = faRocket;
  constructor() { }

  ngOnInit() {
  }

}

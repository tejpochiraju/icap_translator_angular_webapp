import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private httpHeaders;

  constructor(
    private http: HttpClient,
  ) {
    this.httpHeaders = new HttpHeaders({
      'Content-Type':'application/json',
      'Accept': 'application/json',
      'Authorization': `token ${environment.cmsApiKey}:${environment.cmsApiSecret}`
    });
   }

  getSourceVideos() {
    const url = `${environment.cmsEndpoint}/api/resource/Source Video/?fields=["name","title"]&filters=[["Source Video","is_published","=",true]]`;
    return this.http.get(url,{headers:this.httpHeaders}).toPromise();
  }

  getVideoByRef(video_ref) {
    const url = `${environment.cmsEndpoint}/api/resource/Source Video/${video_ref}`;
    return this.http.get(url,{headers:this.httpHeaders}).toPromise();
  }

  getFramesForVideo(video_ref) {
    const url = `${environment.cmsEndpoint}/api/method/icap.api.get_frames?video_ref=${video_ref}`;
    return this.http.get(url,{headers:this.httpHeaders}).toPromise();
  }

  getAvailableLanguages() {
    const url = `${environment.cmsEndpoint}/api/method/icap.api.get_languages`;
    return this.http.get(url,{headers:this.httpHeaders}).toPromise();
  }

  uploadTranslationRequest(request){
    const url = `${environment.cmsEndpoint}/api/resource/Translation Request`;
    return this.http.post(url,JSON.stringify(request),{headers:this.httpHeaders}).toPromise();
  }

  blobToBase64(blob){
    const temporaryFileReader = new FileReader();
    return new Promise((resolve, reject) => {
      temporaryFileReader.onerror = () => {
        temporaryFileReader.abort();
        reject(new DOMException("Problem parsing input file."));
      };
      temporaryFileReader.onload = () => {
        resolve(temporaryFileReader.result);
      };
      temporaryFileReader.readAsDataURL(blob);
    });
  };

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async uploadVoiceovers(voiceovers,translationRequest){
    const url = `${environment.cmsEndpoint}/api/method/icap.api.attach_voiceover_to_request`;
    for (const voiceover of translationRequest.voiceovers) {
      await this.sleep(2000);
      let tmpString = <String>await this.blobToBase64(voiceovers[voiceover.start].blob);
      const base64String = tmpString.split(',')[1];
      const payload = {
        video_ref: translationRequest.name,
        voiceover_ref: voiceover.name,
        start: voiceover.start,
        base64_string: base64String
      }
      const r = await this.http.post(url,payload,{headers:this.httpHeaders}).toPromise();
      console.log(r);
    }
  }

  getTranslatedVideos() {
    const url = `${environment.cmsEndpoint}/api/resource/Translated Video/?fields=["name", "language", "request"]`;
    return this.http.get(url,{headers:this.httpHeaders}).toPromise();
  }

  getTranslatedVideo(video_ref) {
    const url = `${environment.cmsEndpoint}/api/resource/Translated Video/${video_ref}`;
    return this.http.get(url,{headers:this.httpHeaders}).toPromise();
  }
}

// Dans le fichier image-url.interceptor.ts
import { HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

// Nouvelle fonction d'interception
export function imageUrlInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  return next(req).pipe(
    map(event => {
      if (event instanceof HttpResponse && event.body) {
        //console.log('Intercepteur image-url activé pour:', req.url);
        transformUrls(event.body);
      }
      return event;
    })
  );
}

// Fonction de transformation des URLs extraite de votre classe
function transformUrls(data: any): void {
  if (!data) return;
  
  if (Array.isArray(data)) {
    ////console.log('Traitement d\'un tableau de', data.length, 'éléments');
    data.forEach(item => transformUrls(item));
  } else if (typeof data === 'object') {
    //console.log('Traitement d\'un objet');
    
    // Transformer les URLs des photos
    if (data.photos && Array.isArray(data.photos)) {
      data.photos.forEach((photo: any) => {
        if (photo.url && photo.url.startsWith('/uploads/')) {
          photo.url = `${environment.apiUrl}${photo.url}`;
          //console.log('URL transformée :', photo.url);
        }
      });
    }
    
    // Parcourir récursivement les autres propriétés
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'object' && data[key] !== null) {
        transformUrls(data[key]);
      }
    });
  }
}
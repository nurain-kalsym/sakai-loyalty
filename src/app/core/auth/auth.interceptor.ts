import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let loyaltyToken = environment.loyaltyToken;

    // Clone the request to add the new header
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${loyaltyToken}`
      }
    });

    // Pass on the cloned request instead of the original request
    return next.handle(authReq);
  }
}

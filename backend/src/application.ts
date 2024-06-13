import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {MyUserService} from './services';
import {TokenService} from './services/token.service';
import {AuthorizationComponent} from '@loopback/authorization';

import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';

// ---------- ADD IMPORTS -------------
import {AuthenticationComponent} from '@loopback/authentication';
import {DbDataSource} from './datasources';
import {JWTAuthenticationComponent} from '@loopback/authentication-jwt';
import {UserServiceBindings} from './keys';
import {DonationService} from './services/donation.service';

// ------------------------------------

export {ApplicationConfig};
export class BackendApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Bind datasource
    this.dataSource(DbDataSource, UserServiceBindings.DATASOURCE_NAME);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.bind('services.FoodService').toClass(DonationService);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    // ------ ADD SNIPPET AT THE BOTTOM ---------
    // Mount authentication system
    this.component(AuthenticationComponent);
    // Mount jwt component
    this.component(JWTAuthenticationComponent);

    this.component(AuthorizationComponent);

    this.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService);

    this.bind('services.user.service').toClass(MyUserService);
   // this.bind('services.jwt.service').toClass(TokenService);

    // ------------- END OF SNIPPET -------------

    // ------------- END OF SNIPPET -------------
    this.bind('services.AuthorizationService').toClass(MyUserService);
  }
}

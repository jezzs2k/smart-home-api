import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppClusterService } from './shared/app.cluster.service';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const hostDomain = `${AppModule.host}:${AppModule.port}`;

  const swaggerOptions = new DocumentBuilder()
    .setTitle('Nest MEAN')
    .setDescription('API Documentation')
    .addBearerAuth()
    .setVersion('1.0.0')
    .build();

  const swaggerDoc = SwaggerModule.createDocument(app, swaggerOptions);

  app.use('/api/docs/swagger.json', (req, res) => {
    res.send(swaggerDoc);
  });

  SwaggerModule.setup('/api/docs', app, null, {
    swaggerUrl: `${hostDomain}/api/docs/swagger.json`,
    explorer: true,
    swaggerOptions: {
      filter: true,
      docExpansion: 'list',
      showRequiestDuration: true,
    },
  });

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  await app.listen(AppModule.port);
}
bootstrap();
// AppClusterService.clusterize(bootstrap);

import {
  createGlobalPositionStrategy,
  createOverlayRef,
  OverlayConfig,
  OverlayRef,
} from '@angular/cdk/overlay';
import { inject, Injectable, Injector } from '@angular/core';
import { DFileUploadProgressContainer } from '../components/file-upload/file-upload-progress-container';
import {
  DFileProgress,
  DFileUploadProgressConfig,
  DFileUploadProgressContainerRef,
} from '../models/file-upload';
import {
  FILE_UPLOAD_PROGRESS_DATA,
  FILE_UPLOAD_PROGRESS_OPTIONS,
} from '../tokens/config';
import { ComponentPortal } from '@angular/cdk/portal';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DFileUploadProgress {
  private _defaultConfig = inject(FILE_UPLOAD_PROGRESS_OPTIONS);
  private _injector = inject(Injector);

  private _openedUploadProgressContainerRef: DFileUploadProgressContainerRef | null =
    null;

  private _fileProgress$ = new Subject<DFileProgress>();

  track(file: DFileProgress, config?: DFileUploadProgressConfig) {
    if (!this._openedUploadProgressContainerRef) this.attach(config);

    this._fileProgress$.next(file);

    return this._openedUploadProgressContainerRef!;
  }

  private attach(userConfig?: DFileUploadProgressConfig) {
    const config = { ...this._defaultConfig, ...userConfig };
    const overlayRef = this.createOverlay(config);
    this.attachUploadProgressContainer(overlayRef, config);

    const containerRef = new DFileUploadProgressContainerRef(overlayRef);

    containerRef.afterDismissed().subscribe(() => {
      this._openedUploadProgressContainerRef = null;
      this._fileProgress$.complete();
      this._fileProgress$ = new Subject<DFileProgress>();
    });

    this._openedUploadProgressContainerRef = containerRef;

    return containerRef;
  }

  private createOverlay(config: DFileUploadProgressConfig): OverlayRef {
    const overlayConfig = new OverlayConfig();

    const positionStrategy = createGlobalPositionStrategy(this._injector);
    // Set horizontal position.
    const isRtl = config.direction === 'rtl';
    const isLeft =
      config.horizontalPosition === 'left' ||
      (config.horizontalPosition === 'start' && !isRtl) ||
      (config.horizontalPosition === 'end' && isRtl);
    const isRight = !isLeft && config.horizontalPosition !== 'center';
    if (isLeft) {
      positionStrategy.left(this._defaultConfig.sideMargin);
    } else if (isRight) {
      positionStrategy.right(this._defaultConfig.sideMargin);
    } else {
      positionStrategy.centerHorizontally();
    }
    // Set vertical position.
    if (config.verticalPosition === 'top') {
      positionStrategy.top('0');
    } else {
      positionStrategy.bottom('0');
    }

    overlayConfig.positionStrategy = positionStrategy;
    return createOverlayRef(this._injector, overlayConfig);
  }

  private attachUploadProgressContainer(
    overlayRef: OverlayRef,
    config: DFileUploadProgressConfig
  ): DFileUploadProgressContainer {
    const userInjector =
      config && config.viewContainerRef && config.viewContainerRef.injector;
    const injector = Injector.create({
      parent: userInjector || this._injector,
      providers: [
        {
          provide: FILE_UPLOAD_PROGRESS_DATA,
          useValue: this._fileProgress$.asObservable(),
        },
        {
          provide: OverlayRef,
          useValue: overlayRef,
        },
      ],
    });

    const containerPortal = new ComponentPortal(
      DFileUploadProgressContainer,
      config.viewContainerRef,
      injector
    );
    const containerRef = overlayRef.attach(containerPortal);
    return containerRef.instance;
  }
}
